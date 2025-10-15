(function() {
    window.Charlex = window.Charlex || {};
    window.Charlex.DOM = window.Charlex.DOM || {};

    // Ensure and style the dock container so it stays centered and above content
    window.Charlex.DOM.createModernDock = function() {
        let dock = document.getElementById('dock');
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'dock';
            document.body.appendChild(dock);
        }
        // remove legacy classes that may interfere
        dock.classList.remove('fixed-bottom', 'some-legacy-dock');
        dock.classList.add('dock-container', 'bg-dark', 'container', 'd-flex', 'justify-content-center', 'align-items-center');
        // Rely on CSS for visual appearance. Only adjust small-screen bottom offset.
        try {
            if (window.innerWidth <= 480) dock.style.bottom = '10px';
            else dock.style.bottom = '20px';
        } catch (err) {
            // ignore
        }

        // Accessibility: allow keyboard focus inside dock
        dock.setAttribute('role', 'navigation');
        dock.setAttribute('aria-label', 'Application dock');
        return dock;
    };

    // Modern circular thumbnail dock icon creator. opts: {badge, tooltip, attrs}
    window.Charlex.DOM.createDockIcon = function(title, onclick, innerHTML, opts = {}) {
        const dock = window.Charlex.DOM.createModernDock();
        const icon = document.createElement('button');
        icon.className = 'dock-icon btn rounded-circle';
        icon.type = 'button';
        icon.title = opts.tooltip || title || '';
        icon.setAttribute('aria-label', title || 'dock-icon');
        icon.style.touchAction = 'manipulation';

        // content wrapper
        const content = document.createElement('div');
        content.className = 'dock-icon-content';
        content.innerHTML = innerHTML || '';
        icon.appendChild(content);

        // optional badge
        if (opts.badge) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = String(opts.badge);
            icon.appendChild(badge);
        }

        // pointer/touch feedback
        icon.addEventListener('pointerdown', (e) => {
            icon.classList.add('active');
        }, {passive:true});
        icon.addEventListener('pointerup', (e) => {
            icon.classList.remove('active');
        }, {passive:true});
        icon.addEventListener('pointerleave', () => icon.classList.remove('active'));

        // activation
        icon.addEventListener('click', (e) => {
            try { if (typeof onclick === 'function') onclick(e); }
            catch (err) { console.error(err); }
        });

        // keyboard
        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); }
        });

        dock.appendChild(icon);
        return icon;
    };
})();
