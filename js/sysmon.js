document.addEventListener('DOMContentLoaded', () => {
    // Sysmon script using UserAgent Data API

    let currentUsage = 20; // starting simulated usage

    if (!window.Charlex) window.Charlex = {};
    Charlex.topOutput = '';

    async function detectOS() {
        if (navigator.userAgentData) {
            try {
                const data = await navigator.userAgentData.getHighEntropyValues(['platform']);
                const p = data.platform.toLowerCase();
                if (/android/.test(p)) return 'android';
                if (/linux/.test(p)) return 'linux';
                if (/mac|darwin|iphone|ipad|ipod/.test(p)) return 'mac';
                if (/win/.test(p)) return 'windows';
                return 'unknown';
            } catch (e) {
                // fallback to userAgent
            }
        }
        const ua = navigator.userAgent || '';
        const p = (navigator.platform || '').toLowerCase();
        if (/android/.test(ua.toLowerCase())) return 'android';
        if (/linux/.test(p) || /linux/.test(ua)) return 'linux';
        if (/mac|darwin|iphone|ipad|ipod/.test(ua.toLowerCase()) || /mac/.test(p)) return 'mac';
        if (/win/.test(p) || /windows/.test(ua.toLowerCase())) return 'windows';
        return 'unknown';
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
        const os = await detectOS();

        // Show simulated CPU usage based on detected OS
        const msg = `[Simulated CPU Usage for ${os}]`;
        Charlex.topOutput = msg;
        const el = document.getElementById('topOutput');
        if (el) el.textContent = msg;

        // Fallback simulation
        const change = (Math.random() - 0.5) * 10;
        currentUsage += change;
        currentUsage = Math.max(0, Math.min(100, currentUsage));

        const out = formatSimulatedTop(currentUsage);
        Charlex.topOutput = out;
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
