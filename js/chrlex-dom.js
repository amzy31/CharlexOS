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
        windowEl.innerHTML = `
            <div class="window-header" onmousedown="window.Charlex.WindowManager.startDrag(event, '${id}')">
                <div class="window-controls">
                    <div class="window-control-button close" onclick="window.Charlex.WindowManager.closeWindow('${id}')" title="Close"></div>
                    <div class="window-control-button minimize" onclick="window.Charlex.WindowManager.minimizeWindow('${id}')" title="Minimize"></div>
                    <div class="window-control-button maximize" onclick="window.Charlex.WindowManager.maximizeWindow('${id}')" title="Maximize"></div>
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

    // Create dock icon
    window.Charlex.DOM.createDockIcon = function(title, onclick, innerHTML) {
        const icon = document.createElement('div');
        icon.className = 'dock-icon';
        icon.title = title;
        icon.onclick = onclick;
        icon.innerHTML = innerHTML;
        document.getElementById('dock').appendChild(icon);
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
            win.style.display = 'flex';
            win.style.zIndex = 1000;
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
