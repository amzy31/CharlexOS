document.addEventListener('DOMContentLoaded', () => {
    const OVERLAY_ID = 'sys-shutdown-overlay';

    function showShutdownOverlay(message = 'Shutting down…') {
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.85)',
                color: 'white',
                fontSize: '20px',
                zIndex: '2147483646',
                transition: 'opacity 260ms ease'
            });
            document.body.appendChild(overlay);
        }
        overlay.textContent = message;
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
    }

    // We implement a centered modal for unlocking Halt.
    let haltUnlocked = false;

    function createModal(message) {
        // Create overlay container
        let overlay = document.getElementById(OVERLAY_ID + '-modal');
        if (overlay) overlay.remove();
        overlay = document.createElement('div');
        overlay.id = OVERLAY_ID + '-modal';
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            zIndex: '2147483647',
            padding: '20px'
        });

        // Card (frosted glass feel)
        const card = document.createElement('div');
        Object.assign(card.style, {
            background: 'rgba(255,255,255,0.96)',
            color: '#111',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            padding: '18px 20px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        });

        const txt = document.createElement('div');
        txt.textContent = message;
        txt.style.marginBottom = '14px';
        txt.style.fontSize = '16px';
        card.appendChild(txt);

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'center';
        btnRow.style.gap = '10px';

        const unlock = document.createElement('button');
        unlock.className = 'btn btn-primary';
        unlock.textContent = 'Unlock Halt';
        unlock.style.padding = '6px 12px';

        const cancel = document.createElement('button');
        cancel.className = 'btn btn-secondary';
        cancel.textContent = 'Cancel';
        cancel.style.padding = '6px 12px';

        btnRow.appendChild(unlock);
        btnRow.appendChild(cancel);
        card.appendChild(btnRow);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // Accessibility: focus the unlock button
        unlock.focus();

        // Handlers
        const remove = () => { try { overlay.remove(); } catch (e) {} };
        unlock.addEventListener('click', () => { haltUnlocked = true; remove(); showTransient('Halt unlocked'); });
        cancel.addEventListener('click', () => { remove(); });

        // Close on Escape
        function onKey(e) { if (e.key === 'Escape') remove(); }
        window.addEventListener('keydown', onKey, { once: true });
    }

    function showTransient(msg) {
        // small transient top-center toast using overlay area
        let t = document.getElementById('charlex-transient');
        if (!t) {
            t = document.createElement('div');
            t.id = 'charlex-transient';
            Object.assign(t.style, {
                position: 'fixed',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.75)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                zIndex: '2147483650'
            });
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        setTimeout(() => { try { t.style.opacity = '0'; } catch (e) {} }, 1400);
    }

    // Find the Halt icon inside the dock by aria-label or title
    function findHaltIcon() {
        const dock = document.getElementById('dock');
        if (!dock) return null;
        const candidates = dock.querySelectorAll('button, [role="button"], .dock-icon');
        for (const el of candidates) {
            try {
                const lbl = ((el.getAttribute && el.getAttribute('aria-label')) || el.title || '').toLowerCase();
                if (lbl && lbl.includes('halt')) return el;
                // fallback: check text content
                if ((el.textContent || '').toLowerCase().includes('halt')) return el;
            } catch (e) {
                // ignore
            }
        }
        return null;
    }

    // Attach interception logic to the Halt icon; retry until dock exists
    function attachHaltInterceptor(retries = 8) {
        const haltIcon = findHaltIcon();
        if (!haltIcon) {
            if (retries > 0) setTimeout(() => attachHaltInterceptor(retries - 1), 350);
            return;
        }

        // Add a capturing listener that prevents default behavior and enforces unlock
        haltIcon.addEventListener('click', (ev) => {
            try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
            if (!haltUnlocked) {
                showShutdownOverlay('Halt is locked. Click Unlock Halt to enable.');
                unlockBtn.style.display = 'inline-block';
                return;
            }
            // Halt is unlocked: perform simulated halt
            showShutdownOverlay('System halted. (Simulated)');
        }, { passive: false });
    }

    attachHaltInterceptor();
});
