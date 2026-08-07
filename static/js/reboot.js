document.addEventListener('DOMContentLoaded', () => {
    // Ensure dock exists and use Charlex.DOM helpers to create icons
    if (window.Charlex && window.Charlex.DOM && typeof window.Charlex.DOM.createModernDock === 'function') {
        try { window.Charlex.DOM.createModernDock(); } catch (e) { /* ignore */ }
    }

    // Small helper to show a simulated shutdown overlay
    function showShutdownOverlay(message = 'Shutting down…') {
        let overlay = document.getElementById('sys-shutdown-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sys-shutdown-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.85)',
                color: 'white',
                fontSize: '20px',
                zIndex: '2147483646'
            });
            document.body.appendChild(overlay);
        }
        overlay.textContent = message;
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
    }

    // Power Off icon
    if (window.Charlex && window.Charlex.DOM && typeof window.Charlex.DOM.createDockIcon === 'function') {
        
        // Halt icon: show overlay and an "Unlock Halt" button (Bootstrap primary)
        window.Charlex.DOM.createDockIcon('Halt', () => {
            showShutdownOverlay('System halted. (Simulated)');
            // Ensure overlay exists
            const overlay = document.getElementById('sys-shutdown-overlay');
            if (!overlay) return;
            // Avoid creating the button multiple times
            let unlock = document.getElementById('unlockHaltBtn');
            if (!unlock) {
                unlock = document.createElement('button');
                unlock.id = 'unlockHaltBtn';
                // Use Bootstrap primary styling when available
                unlock.className = 'btn btn-primary btn-sm';
                unlock.textContent = 'Unlock Halt';
                // Place it centered under the overlay text
                Object.assign(unlock.style, {
                    marginTop: '12px'
                });
                // Append inside overlay so it appears centered
                overlay.appendChild(unlock);

                unlock.addEventListener('click', () => {
                    // Dismiss overlay and remove button
                    try {
                        overlay.style.opacity = '0';
                        overlay.style.pointerEvents = 'none';
                        const btn = document.getElementById('unlockHaltBtn');
                        if (btn) btn.remove();
                    } catch (e) {
                        // ignore
                    }
                });
            }
        }, '<span style="font-size: 18px;">⏹</span>', { tooltip: 'Halt' });

        // Restart icon
        window.Charlex.DOM.createDockIcon('Restart', () => {
            if (confirm('Restart the system?')) {
                showShutdownOverlay('Restarting…');
                setTimeout(() => window.location.reload(), 700);
            }
        }, '<span style="font-size: 18px;">⟲</span>', { tooltip: 'Restart' });
    }
});
