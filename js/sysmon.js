document.addEventListener('DOMContentLoaded', () => {
    // A richer sysmon script that tries to use an optional middleware to run real OS commands
    // (GET /sysmon returning plain/text or JSON { output: '...' }) or POST /execute { command }
    // If no middleware is available we gracefully fall back to a client-side simulated view.

    let currentUsage = 20; // starting simulated usage

    if (!window.Charlex) window.Charlex = {};
    Charlex.topOutput = '';

    // Optional WebAssembly "backendless" helper. If you place a compiled
    // WebAssembly module at /wasm/sysmon.wasm that exports a function
    // `next_delta()` (returns an i32 delta in range -128..127) or `rand_u32()`
    // we will use it to drive the simulated metrics. If the wasm is missing
    // or fails to instantiate we silently continue with the JS fallback.
    window.Charlex.WasmSysmon = window.Charlex.WasmSysmon || { ready: false, exports: null };

    async function loadWasmSysmon() {
        try {
            // prefer instantiateStreaming where available
            let inst;
            if (WebAssembly.instantiateStreaming) {
                const r = await fetch('/wasm/sysmon.wasm', { cache: 'no-store' });
                if (!r.ok) throw new Error('WASM not found');
                inst = await WebAssembly.instantiateStreaming(r, {});
            } else {
                const bin = await (await fetch('/wasm/sysmon.wasm', { cache: 'no-store' })).arrayBuffer();
                inst = await WebAssembly.instantiate(bin, {});
            }
            window.Charlex.WasmSysmon.ready = true;
            window.Charlex.WasmSysmon.exports = inst.instance.exports || inst.exports || null;
            console.info('Wasm sysmon loaded', !!window.Charlex.WasmSysmon.exports);
        } catch (err) {
            // silently fail and rely on JS fallback
            window.Charlex.WasmSysmon.ready = false;
            window.Charlex.WasmSysmon.exports = null;
            // console.debug('Wasm sysmon not available:', err.message);
        }
    }

    // attempt to load on startup (best-effort)
    loadWasmSysmon();

    function detectOS() {
        const ua = navigator.userAgent || '';
        const p = (navigator.platform || '').toLowerCase();
        if (/android/.test(ua.toLowerCase())) return 'android';
        if (/linux/.test(p) || /linux/.test(ua)) return 'linux';
        if (/mac|darwin|iphone|ipad|ipod/.test(ua.toLowerCase()) || /mac/.test(p)) return 'mac';
        if (/win/.test(p) || /windows/.test(ua.toLowerCase())) return 'windows';
        return 'unknown';
    }

    function suggestedCommandFor(os) {
        switch(os) {
            case 'linux': return 'top -b -n 1';
            case 'mac': return 'top -l 1';
            case 'windows': return 'typeperf -sc 1 "\\Processor(_Total)\\% Processor Time"';
            case 'android': return 'top -n 1';
            default: return 'top -b -n 1';
        }
    }

    // Detect whether we have access to Node's child_process (Electron with nodeIntegration,
    // or a Node environment). This allows executing `top` locally when running in such an
    // environment (useful for kiosk/Electron setups). In a regular browser this is false.
    function canRunLocalCommands() {
        try {
            if (typeof process !== 'undefined' && process && (process.versions && (process.versions.node || process.versions.electron))) {
                // In Node or Electron main; `require` available in many contexts
                return typeof require === 'function';
            }
            // Also detect Electron renderer with nodeIntegration (window.process)
            if (typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron) {
                return typeof require === 'function';
            }
        } catch (e) {
            // ignore
        }
        return false;
    }

    function runTopLocally(command) {
        try {
            const cp = (typeof require === 'function') ? require('child_process') : null;
            if (!cp) return null;
            // Use a small timeout to avoid hanging the UI
            const out = cp.execSync(command, { encoding: 'utf8', timeout: 3000 });
            return String(out || '').trim();
        } catch (err) {
            return null;
        }
    }

    async function tryMiddlewareSysmon() {
        // Only attempt middleware that talks to the host OS when running on Linux.
        // For other platforms we skip network-execution attempts and surface a message.
        const os = detectOS();
        if (os !== 'linux') return null;

        // Try a simple GET /sysmon endpoint
        try {
            const r = await fetch('/sysmon', { cache: 'no-store' });
            if (r.ok) {
                const txt = await r.text();
                // If JSON, try to parse
                try {
                    const j = JSON.parse(txt);
                    return j.output || j.data || String(txt);
                } catch (e) {
                    return txt;
                }
            }
        } catch (err) {
            // ignore and fall through
        }

        // Try POST /execute if available (used elsewhere in this app)
        try {
            const command = suggestedCommandFor(os);
            const r2 = await fetch('/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            if (r2.ok) {
                const j = await r2.json();
                // Expect { output: '...' } or similar
                if (typeof j === 'object' && j !== null) return j.output || j.stdout || JSON.stringify(j);
                return String(j);
            }
        } catch (err) {
            // ignore
        }

        return null; // no middleware available
    }

    function formatSimulatedTop(usage) {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const up = '0 days, 0:12';
        const load = (Math.random()*0.1).toFixed(2) + ', ' + (Math.random()*0.1).toFixed(2) + ', ' + (Math.random()*0.1).toFixed(2);
        const idle = Math.max(0, 100 - Math.round(usage));

        return `top - ${time} up ${up},  1 user,  load average: ${load}\n` +
            `Tasks: 100 total,   1 running,  99 sleeping,   0 stopped,   0 zombie\n` +
            `%Cpu(s): ${Math.round(usage)}.0 us,  0.0 sy,  0.0 ni, ${idle}.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\n`;
    }

    async function updateCPU() {
        const os = detectOS();

        // If not Linux, show the short message and do not attempt to run host `top`.
        if (os !== 'linux') {
            const msg = '[Only available for the Linux kernel]';
            Charlex.topOutput = msg;
            const el = document.getElementById('topOutput');
            if (el) el.textContent = msg;
            return;
        }

        // We're on Linux. Prefer local execution (Electron/Node) when available.
        if (canRunLocalCommands()) {
            const local = runTopLocally(suggestedCommandFor('linux'));
            if (local) {
                Charlex.topOutput = local;
                const el = document.getElementById('topOutput');
                if (el) el.textContent = Charlex.topOutput;
                return;
            }
        }

        // Next try middleware that can execute commands on the host
        const mw = await tryMiddlewareSysmon();
        if (mw) {
            Charlex.topOutput = String(mw);
            const el = document.getElementById('topOutput');
            if (el) el.textContent = Charlex.topOutput;
            return;
        }

        // Fallback simulation when nothing else is available
        const change = (Math.random() - 0.5) * 10;
        currentUsage += change;
        currentUsage = Math.max(0, Math.min(100, currentUsage));

        const out = formatSimulatedTop(currentUsage);
        Charlex.topOutput = out;
        const el = document.getElementById('topOutput');
        if (el) el.textContent = out;
    }

    // Poll regularly
    setInterval(updateCPU, 2000);
    updateCPU();
});

// Function to open CPU window
function openCPUWindow() {
    const win = document.getElementById('cpuWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
}
