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
        dock.classList.add('dock-container', 'bg-dark', 'd-flex', 'justify-content-center', 'align-items-center');
        const isMobile = window.innerWidth <= 480;
        dock.style.width = isMobile ? 'calc(100vw - 16px)' : 'auto';
        dock.style.maxWidth = isMobile ? 'calc(100vw - 16px)' : 'calc(100vw - 20px)';
        dock.style.flexWrap = 'nowrap';
        dock.style.overflowX = 'auto';
        dock.style.overflowY = 'hidden';
        dock.style.scrollbarWidth = 'none';
        dock.style.webkitOverflowScrolling = 'touch';
        dock.style.touchAction = 'pan-x';
        dock.style.justifyContent = isMobile ? 'flex-start' : 'center';
        dock.style.gap = isMobile ? '8px' : '14px';
        dock.style.padding = isMobile ? '8px 10px' : '12px 18px';
        dock.style.minHeight = isMobile ? '52px' : '68px';
        if (isMobile) {
            dock.style.left = '8px';
            dock.style.right = '8px';
            dock.style.transform = 'none';
            dock.style.bottom = '10px';
        } else {
            dock.style.left = '50%';
            dock.style.right = 'auto';
            dock.style.transform = 'translateX(-50%)';
            dock.style.bottom = '20px';
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
        icon.className = 'dock-icon btn btn-dark rounded-circle d-flex justify-content-center align-items-center';
        icon.type = 'button';
        icon.title = opts.tooltip || title || '';
        icon.setAttribute('aria-label', title || 'dock-icon');
        icon.style.touchAction = 'manipulation';
        icon.style.display = 'flex';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';

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
