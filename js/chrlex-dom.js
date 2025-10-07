(function() {
    window.Charlex = window.Charlex || {};
    window.Charlex.DOM = {};

    // Create a window element
    window.Charlex.DOM.createWindow = function(id, title, contentHTML, top = '50px', left = '50px', display = 'none') {
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.id = id;
        windowEl.style.top = top;
        windowEl.style.left = left;
        windowEl.style.display = display;
        // Default size: use a comfortable width and half of the usable viewport height
        try {
            const dock = document.getElementById('dock');
            const dockHeight = dock ? (parseInt(window.getComputedStyle(dock).height) || 80) : 80;
            windowEl.style.width = '80%';
            windowEl.style.maxWidth = Math.max(360, Math.min(window.innerWidth - 40, 1100)) + 'px';
            windowEl.style.height = Math.floor((window.innerHeight - dockHeight) / 2) + 'px';
        } catch (err) {
            // Fallback to CSS defaults if anything fails
            windowEl.style.width = '80%';
        }
        windowEl.innerHTML = `
            <div class="window-header" onmousedown="window.Charlex.WindowManager.startDrag(event, '${id}')">
                <div class="window-controls">
                    <div class="window-control-button close" onclick="window.Charlex.WindowManager.closeWindow('${id}')" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()" title="Close" role="button" tabindex="0"></div>
                    <div class="window-control-button minimize" onclick="window.Charlex.WindowManager.minimizeWindow('${id}')" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()" title="Minimize" role="button" tabindex="0"></div>
                    <div class="window-control-button maximize" onclick="window.Charlex.WindowManager.maximizeWindow('${id}')" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()" title="Maximize" role="button" tabindex="0"></div>
                </div>
                <div class="window-title">${title}</div>
                <div style="width: 48px;"></div>
            </div>
            <div class="window-content">
                ${contentHTML}
            </div>
        `;
        document.getElementById('desktop').appendChild(windowEl);
        return windowEl;
    };

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
        dock.classList.add('dock-container');
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
        icon.className = 'dock-icon';
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

    // Efficient DOM update
    window.Charlex.DOM.updateElement = function(selector, content) {
        const el = document.querySelector(selector);
        if (el) {
            el.innerHTML = content;
        }
    };

    // Batch DOM updates
    window.Charlex.DOM.batchUpdate = function(updates) {
        const fragment = document.createDocumentFragment();
        updates.forEach(update => {
            const el = document.createElement('div');
            el.innerHTML = update.html;
            fragment.appendChild(el.firstElementChild);
        });
        // But for updates, perhaps use a map.
        // For simplicity, assume updates is array of {selector, html}
        updates.forEach(update => {
            Charlex.DOM.updateElement(update.selector, update.html);
        });
    };

    // Show window
    window.Charlex.DOM.showWindow = function(id) {
        const win = document.getElementById(id);
        if (win) {
                // Prefer WindowManager.openWindow to ensure consistent focus behavior
                if (window.Charlex && window.Charlex.WindowManager && typeof window.Charlex.WindowManager.openWindow === 'function') {
                    try { window.Charlex.WindowManager.openWindow(id); return; } catch (err) { /* fallthrough */ }
                }
                win.style.display = 'flex';
                // ensure it's on top
                win.style.zIndex = (parseInt(win.style.zIndex) || 10000) + 1;
        }
    };

    // Hide window
    window.Charlex.DOM.hideWindow = function(id) {
        const win = document.getElementById(id);
        if (win) {
            win.style.display = 'none';
        }
    };

    // Run bash command and update window content
    window.Charlex.DOM.runBash = async function(command, windowId) {
        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command })
            });
            const data = await response.json();
            const win = document.getElementById(windowId);
            if (win) {
                const pre = win.querySelector('#topOutput');
                if (pre) {
                    pre.textContent = data.output;
                } else {
                    const content = win.querySelector('.window-content');
                    if (content) {
                        content.innerHTML = `<pre>${data.output}</pre>`;
                    }
                }
            }
        } catch (error) {
            const win = document.getElementById(windowId);
            if (win) {
                const pre = win.querySelector('#topOutput');
                if (pre) {
                    pre.textContent = 'Error: Failed to execute command';
                }
            }
        }
    };

    // --- Window Manager (merged from js/window_manager.js) -----------------
    window.Charlex.WindowManager = {};
    // Lightweight in-memory state for dragging and z-index stacking
    (function() {
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
                // Compute a half-screen maximized state so windows never fully cover the dock
                try {
                    const dock = document.getElementById('dock');
                    const dockHeight = dock ? (parseInt(window.getComputedStyle(dock).height) || 80) : 80;
                    win.style.left = '0px';
                    win.style.top = '0px';
                    win.style.width = window.innerWidth + 'px';
                    win.style.height = Math.floor((window.innerHeight - dockHeight) / 2) + 'px';
                } catch (err) {
                    win.style.left = '0px';
                    win.style.top = '0px';
                    win.style.width = window.innerWidth + 'px';
                    win.style.height = Math.floor((window.innerHeight - 80) / 2) + 'px';
                }
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

})();
