(function() {
    window.Charlex = window.Charlex || {};
    window.Charlex.WindowManager = {};
    // Lightweight in-memory state for dragging and z-index stacking
    let dragData = {
        dragging: false,
        targetId: null,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        mouseX: 0,
        mouseY: 0,
        rafId: null,
    };

    // Keep track of stacking order. Start high so windows appear above any persistent UI
    // (the dock uses a high z-index via CSS). We'll also guard inside focusWindow.
    let zCounter = 10000;

    function focusWindow(el) {
        if (!el) return;
        // Ensure we are above the dock (if present) by checking computed z-index
        try {
            const dock = document.getElementById('dock');
            if (dock) {
                const dockZ = parseInt(window.getComputedStyle(dock).zIndex) || 0;
                if (zCounter <= dockZ) zCounter = dockZ + 1;
            }
        } catch (err) {
            // ignore
        }
        zCounter += 1;
        el.style.zIndex = zCounter;
        // add a focused class for potential styling
        document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
        el.classList.add('focused');
    }

    // Smooth reposition using requestAnimationFrame on fixed window coordinates
    function dragFrame() {
        if (!dragData.dragging) return;
        const target = document.getElementById(dragData.targetId);
        if (!target) return;
        let newX = dragData.startLeft + (dragData.mouseX - dragData.startX);
        let newY = dragData.startTop + (dragData.mouseY - dragData.startY);
        // Keep window inside viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - target.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - target.offsetHeight - 80)); // 80 for dock height + margin
        target.style.left = `${newX}px`;
        target.style.top = `${newY}px`;
        dragData.rafId = window.requestAnimationFrame(dragFrame);
    }

    // Start drag (mouse or touch) from header. e is a MouseEvent or Touch
    window.Charlex.WindowManager.startDrag = function(e, id) {
        // Don't start drag if clicking on controls
        if (e.target.closest('.window-controls')) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        focusWindow(target);
        dragData.dragging = true;
        dragData.targetId = id;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragData.startX = clientX;
        dragData.startY = clientY;
        dragData.startLeft = target.offsetLeft || 0;
        dragData.startTop = target.offsetTop || 0;
        dragData.mouseX = clientX;
        dragData.mouseY = clientY;
        target.style.transition = 'none';
        target.style.willChange = 'left, top';
        target.classList.add('dragging');
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        // start rAF loop
        if (!dragData.rafId) dragData.rafId = window.requestAnimationFrame(dragFrame);
    };

    // pointer / mouse / touch moves update mouseX/mouseY only
    function onPointerMove(e) {
        if (!dragData.dragging) return;
        if (e.touches && e.touches.length) {
            dragData.mouseX = e.touches[0].clientX;
            dragData.mouseY = e.touches[0].clientY;
        } else if (e.clientX !== undefined) {
            dragData.mouseX = e.clientX;
            dragData.mouseY = e.clientY;
        }
    }

    function endDrag() {
        if (dragData.dragging) {
            const target = document.getElementById(dragData.targetId);
            if (target) {
                target.classList.remove('dragging');
                target.style.willChange = '';
                target.style.transition = '';
            }
        }
        dragData.dragging = false;
        dragData.targetId = null;
        document.body.style.userSelect = 'auto';
        document.body.style.cursor = '';
        if (dragData.rafId) {
            window.cancelAnimationFrame(dragData.rafId);
            dragData.rafId = null;
        }
    }

    window.addEventListener('pointermove', onPointerMove, {passive: true});
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', endDrag);

    window.Charlex.WindowManager.closeWindow = function(id) {
        const win = document.getElementById(id);
        if (!win) return;
        win.style.display = 'none';
        win.classList.remove('focused');
    };

    window.Charlex.WindowManager.minimizeWindow = function(id) {
        const win = document.getElementById(id);
        if (!win) return;
        // animate scale down to dock could be added; for now hide and remove focus
        win.style.display = 'none';
        win.classList.remove('focused');
    };

    window.Charlex.WindowManager.maximizeWindow = function(id) {
        const win = document.getElementById(id);
        if (!win || win._maximizing) return;
        win._maximizing = true;
        setTimeout(() => win._maximizing = false, 300); // prevent multiple calls
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (win.classList.contains('maximized')) {
            const prev = win._prevRect;
            if (prev) {
                win.style.setProperty('left', prev.left, 'important');
                win.style.setProperty('top', prev.top, 'important');
                win.style.width = prev.width;
                win.style.height = prev.height;
                win.style.maxWidth = prev.maxWidth || '';
                win.style.maxHeight = prev.maxHeight || '';
                win.style.transform = prev.transform || 'none';
            }
            win.classList.remove('maximized');
            if (isMobile) {
                const dock = document.getElementById('dock');
                if (dock) dock.style.display = '';
            }
        } else {
            win._prevRect = {
                left: win.style.left || `${win.offsetLeft}px`,
                top: win.style.top || `${win.offsetTop}px`,
                width: win.style.width || `${win.offsetWidth}px`,
                height: win.style.height || `${win.offsetHeight}px`,
                maxWidth: win.style.maxWidth || '',
                maxHeight: win.style.maxHeight || '',
                transform: getComputedStyle(win).transform || 'none'
            };
            win.style.transition = 'all 0.5s ease-out';
            win.style.transform = 'none';
            win.style.setProperty('left', '0px', 'important');
            win.style.setProperty('top', '0px', 'important');
            win.style.width = window.innerWidth + 'px';
            win.style.maxWidth = '100vw';
            win.style.height = window.innerHeight + 'px';
            win.style.maxHeight = '100vh';
            win.classList.add('maximized');
        }
        focusWindow(win);
    };

    window.Charlex.WindowManager.openWindow = function(id) {
        const win = document.getElementById(id);
        if (!win) return;
        win.style.display = 'flex';
        focusWindow(win);
    };

    // Attach convenient behaviors for all windows on DOMContentLoaded
    function initWindowManager() {
        document.querySelectorAll('.window').forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;
            // Pointer down on header starts drag
            header.addEventListener('pointerdown', (ev) => {
                if (ev.button !== 0 || win.classList.contains('maximized')) return;
                window.Charlex.WindowManager.startDrag(ev, win.id);
            }, {passive: false});
            // Allow touch drag when touching near the top of the window (helps mobile UX when header is small)
            win.addEventListener('touchstart', (ev) => {
                try {
                    const t = ev.touches && ev.touches[0];
                    if (!t) return;
                    const relY = t.clientY - win.getBoundingClientRect().top;
                    // if touch is within the top 56px, start dragging (header area)
                    if (relY >= 0 && relY <= 56) {
                        window.Charlex.WindowManager.startDrag(ev, win.id);
                    }
                } catch (err) {
                    // ignore
                }
            }, {passive: true});
            // Double-click header toggles maximize
            header.addEventListener('dblclick', () => {
                window.Charlex.WindowManager.maximizeWindow(win.id);
            });
            // Focus on mousedown/click
            win.addEventListener('mousedown', () => focusWindow(win));
            // Focus on touch (tap) and detect quick double-tap for maximize
            let lastTap = 0;
            win.addEventListener('touchend', (ev) => {
                focusWindow(win);
                const now = Date.now();
                if (now - lastTap < 300) {
                    // double-tap -> toggle maximize
                    window.Charlex.WindowManager.maximizeWindow(win.id);
                    lastTap = 0;
                } else {
                    lastTap = now;
                }
            });

            // Control buttons with specific listeners
            const closeBtn = win.querySelector('.window-control-button.close');
            if (closeBtn) closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                win.style.display = 'none';
            });
            const minBtn = win.querySelector('.window-control-button.minimize');
            if (minBtn) minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                win.style.display = 'none'; // minimize by hiding
            });
            const maxBtn = win.querySelector('.window-control-button.maximize');
            if (maxBtn) maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.Charlex.WindowManager.maximizeWindow(win.id);
            });
        });

        // Keyboard shortcuts for focused window
        window.addEventListener('keydown', (e) => {
            const focused = document.querySelector('.window.focused');
            if (!focused) return;
            const isCmd = e.metaKey || e.ctrlKey;
            if (isCmd && e.key.toLowerCase() === 'w') {
                // close
                e.preventDefault();
                focused.style.display = 'none';
            } else if (isCmd && e.key.toLowerCase() === 'm') {
                // minimize
                e.preventDefault();
                focused.style.display = 'none';
            } else if (isCmd && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                // maximize/restore
                e.preventDefault();
                window.Charlex.WindowManager.maximizeWindow(focused.id);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWindowManager);
    } else {
        initWindowManager();
    }

    // Expose for re-initialization after dynamic window creation
    window.Charlex.WindowManager.initWindowManager = initWindowManager;

    // Backward compatibility
    window.startDrag = window.Charlex.WindowManager.startDrag;
    window.closeWindow = window.Charlex.WindowManager.closeWindow;
    window.minimizeWindow = window.Charlex.WindowManager.minimizeWindow;
    window.maximizeWindow = window.Charlex.WindowManager.maximizeWindow;
    window.openWindow = window.Charlex.WindowManager.openWindow;
})();
