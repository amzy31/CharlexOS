(function() {
    window.Charlex = window.Charlex || {};
    window.Charlex.WindowManager = {};
    // Lightweight in-memory state for dragging and z-index stacking
    let dragData = {
        dragging: false,
        targetId: null,
        offsetX: 0,
        offsetY: 0,
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

    // Smooth reposition using requestAnimationFrame to avoid layout thrash
    function dragFrame() {
        if (!dragData.dragging) return;
        const target = document.getElementById(dragData.targetId);
        if (!target) return;
        let newX = dragData.mouseX - dragData.offsetX;
        let newY = dragData.mouseY - dragData.offsetY;
        // Keep window inside viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - target.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - target.offsetHeight - 80)); // 80 for dock height + margin
        target.style.left = newX + 'px';
        target.style.top = newY + 'px';
        dragData.rafId = window.requestAnimationFrame(dragFrame);
    }

    // Start drag (mouse or touch) from header. e is a MouseEvent or Touch
    window.Charlex.WindowManager.startDrag = function(e, id) {
        const target = document.getElementById(id);
        if (!target) return;
        focusWindow(target);
        dragData.dragging = true;
        dragData.targetId = id;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragData.offsetX = clientX - (target.offsetLeft || 0);
        dragData.offsetY = clientY - (target.offsetTop || 0);
        dragData.mouseX = clientX;
        dragData.mouseY = clientY;
        document.body.style.userSelect = 'none';
        // start rAF loop
        if (!dragData.rafId) dragData.rafId = window.requestAnimationFrame(dragFrame);
    };

    // pointer / mouse / touch moves update mouseX/mouseY only
    function onPointerMove(e) {
        if (e.touches && e.touches.length) {
            dragData.mouseX = e.touches[0].clientX;
            dragData.mouseY = e.touches[0].clientY;
        } else if (e.clientX !== undefined) {
            dragData.mouseX = e.clientX;
            dragData.mouseY = e.clientY;
        }
    }

    function endDrag() {
        dragData.dragging = false;
        dragData.targetId = null;
        document.body.style.userSelect = 'auto';
        if (dragData.rafId) {
            window.cancelAnimationFrame(dragData.rafId);
            dragData.rafId = null;
        }
    }

    window.addEventListener('mousemove', onPointerMove, {passive: true});
    window.addEventListener('touchmove', onPointerMove, {passive: true});
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

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
        if (!win) return;
        if (win.classList.contains('maximized')) {
            // Restore using stored values
            const prev = win._prevRect;
            if (prev) {
                win.style.left = prev.left + 'px';
                win.style.top = prev.top + 'px';
                win.style.width = prev.width + 'px';
                win.style.height = prev.height + 'px';
            }
            win.classList.remove('maximized');
        } else {
            // Store previous geometry
            win._prevRect = {
                left: win.offsetLeft,
                top: win.offsetTop,
                width: win.offsetWidth,
                height: win.offsetHeight
            };
            win.style.left = '0px';
            win.style.top = '0px';
            win.style.width = window.innerWidth + 'px';
            win.style.height = window.innerHeight + 'px';
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
            // Mouse down on header starts drag
            header.addEventListener('mousedown', (ev) => {
                // only left button
                if (ev.button !== 0) return;
                window.Charlex.WindowManager.startDrag(ev, win.id);
            });
            header.addEventListener('touchstart', (ev) => {
                window.Charlex.WindowManager.startDrag(ev, win.id);
            }, {passive: true});
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

    // Backward compatibility
    window.startDrag = window.Charlex.WindowManager.startDrag;
    window.closeWindow = window.Charlex.WindowManager.closeWindow;
    window.minimizeWindow = window.Charlex.WindowManager.minimizeWindow;
    window.maximizeWindow = window.Charlex.WindowManager.maximizeWindow;
    window.openWindow = window.Charlex.WindowManager.openWindow;
})();
