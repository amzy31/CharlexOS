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
            // Remove inline width and height styles to use Bootstrap responsiveness
            // windowEl.style.width = '80%';
            // windowEl.style.maxWidth = Math.max(360, Math.min(window.innerWidth - 40, 1100)) + 'px';
            // windowEl.style.height = Math.floor((window.innerHeight - dockHeight) / 2) + 'px';
        } catch (err) {
            // Fallback to CSS defaults if anything fails
            // windowEl.style.width = '80%';
        }
        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-controls">
                    <button class="window-control-button close" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()" title="Close" tabindex="0"></button>
                    <button class="window-control-button minimize" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()" title="Minimize" tabindex="0"></button>
                    <button class="window-control-button maximize" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()" title="Maximize" tabindex="0"></button>
                </div>
                <div class="window-title bg-dark container">${title}</div>
                <div style="width: 48px;"></div>
            </div>
            <div class="window-content container p-5">
                ${contentHTML}
            </div>
        `;
        document.getElementById('desktop').appendChild(windowEl);
        return windowEl;
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

})();
