 // This is the list of all windows in the Web-OS. Each window has an ID, title, content, position, size, and other properties.
        const windows = [
            {
                id: 'window1',
                title: 'Welcome',
                content: 'Welcome to Charlex Web OS!',
                position: { top: 50, left: 50 },
                size: { width: 300, height: 200 }
            },
            {
                id: 'noteWindow',
                title: 'Note',
                content: `
                    <form method="POST" action="/note" style="flex: 1; margin: 10px; display: flex; flex-direction: column;">
                        <textarea id="noteContent" name="noteContent" style="flex: 1; resize: none; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 8px; padding: 8px; font-size: 14px;" placeholder="Type your note here...">{{ note_content }}</textarea>
                        <button type="button" id="saveDownloadBtn" style="margin-top: 8px; padding: 6px 12px; border: none; border-radius: 8px; background-color: #1e90ff; color: white; font-weight: bold; cursor: pointer;">Save</button>
                    </form>
                `,
                position: { top: 100, left: 100 },
                size: { width: 400, height: 300 },
                flex: true
            },
            {
                id: 'webdiskWindow',
                title: 'WebDisk',
                content: `
                    <div id="webdiskContent" style="flex: 1; padding: 0; display: flex; flex-direction: column;">
                        <div id="webdiskLogin">
                            <div id="loginMessage" style="color: red; margin-bottom: 10px;"></div>
                            <input type="text" id="username" placeholder="Username" style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                            <input type="password" id="password" placeholder="Password" style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                            <button onclick="webdiskLogin()" style="width: 100%; padding: 8px; background: #1e90ff; color: white; border: none;">Login</button>
                            <button onclick="showRegister()" style="width: 100%; margin-top: 10px; padding: 8px; background: #28a745; color: white; border: none;">Register</button>
                        </div>
                        <div id="webdiskRegister" style="display: none;">
                            <div id="registerMessage" style="color: red; margin-bottom: 10px;"></div>
                            <input type="text" id="regUsername" placeholder="Username" style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                            <input type="password" id="regPassword" placeholder="Password" style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                            <button onclick="webdiskRegister()" style="width: 100%; padding: 8px; background: #28a745; color: white; border: none;">Register</button>
                            <button onclick="showLogin()" style="width: 100%; margin-top: 10px; padding: 8px; background: #6c757d; color: white; border: none;">Back to Login</button>
                        </div>
                        <div id="webdiskUnlock" style="display: none;">
                            <div id="unlockMessage" style="color: red; margin-bottom: 10px;"></div>
                            <input type="password" id="passphrase" placeholder="Passphrase" style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                            <button onclick="webdiskUnlock()" style="width: 100%; padding: 8px; background: #1e90ff; color: white; border: none;">Unlock</button>
                        </div>
                        <div id="webdiskFiles" style="display: none; flex: 1; display: flex; flex-direction: column;">
                            <div id="readonlyBadge" style="display: none; color: red; padding: 10px; font-weight: bold; background: rgba(255,0,0,0.1);">User passphrase is not valid (ReadOnly files/directory)</div>
                            <div class="toolbar" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.2);">
                                <button id="backBtn" onclick="navigateFolder('root')" style="padding: 5px 10px; margin-right: 10px; background: rgba(255,255,255,0.2); border: none; border-radius: 4px; color: white;">← Back</button>
                                <div id="pathBar" style="flex: 1; color: white;">Root</div>
                                <input type="text" id="folderName" placeholder="New directory name" style="margin-right: 10px; padding: 5px; width: 150px;">
                                <button onclick="createFolder()" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 4px;">New Directory</button>
                                <label for="fileInput" style="margin-left: 10px; padding: 5px 10px; background: #1e90ff; color: white; border: none; border-radius: 4px; cursor: pointer;">Upload File</label>
                                <input type="file" id="fileInput" style="display: none;" onchange="webdiskUpload()">
                                <button onclick="webdiskLogout()" style="margin-left: 10px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px;">Logout</button>
                            </div>
                            <div class="main-area" style="flex: 1; padding: 10px; overflow-y: auto;">
                                <div id="itemsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;"></div>
                            </div>
                        </div>
                    </div>
                `,
                position: { top: 150, left: 150 },
                size: { width: 600, height: 500 },
                flex: true
            },
            {
                id: 'calculatorWindow',
                title: 'Calculator',
                content: `
                    <div id="calculator">
                        <input type="text" id="calc-display" readonly>
                        <div class="buttons">
                            <button onclick="appendToDisplay('7')">7</button>
                            <button onclick="appendToDisplay('8')">8</button>
                            <button onclick="appendToDisplay('9')">9</button>
                            <button onclick="appendToDisplay('+')">+</button>
                            <button onclick="appendToDisplay('4')">4</button>
                            <button onclick="appendToDisplay('5')">5</button>
                            <button onclick="appendToDisplay('6')">6</button>
                            <button onclick="appendToDisplay('-')">-</button>
                            <button onclick="appendToDisplay('1')">1</button>
                            <button onclick="appendToDisplay('2')">2</button>
                            <button onclick="appendToDisplay('3')">3</button>
                            <button onclick="appendToDisplay('*')">*</button>
                            <button onclick="appendToDisplay('0')">0</button>
                            <button onclick="appendToDisplay('.')">.</button>
                            <button onclick="calculate()">=</button>
                            <button onclick="appendToDisplay('/')">/</button>
                            <button onclick="clearDisplay()">C</button>
                        </div>
                    </div>
                `,
                position: { top: 200, left: 200 },
                size: { width: 300, height: 400 }
            },
            {
                id: 'shellWindow',
                title: 'Shell Terminal',
                content: `
                    <div id="shell-output" style="height: 300px; background: #000; color: #0f0; padding: 10px; font-family: monospace; overflow-y: auto; white-space: pre-wrap;"></div>
                    <div style="display: flex; margin-top: 10px;">
                        <input type="text" id="shell-input" placeholder="Enter command..." style="flex: 1; padding: 5px;">
                        <button onclick="executeShellCommand()" style="padding: 5px 10px; background: #1e90ff; color: white; border: none;">Execute</button>
                        <button onclick="clearShellOutput()" style="padding: 5px 10px; background: #6c757d; color: white; border: none;">Clear</button>
                    </div>
                `,
                position: { top: 250, left: 250 },
                size: { width: 600, height: 400 },
                flex: true
            },
            {
                id: 'networkWindow',
                title: 'Network Tools',
                content: `
                    <div id="network-status" style="margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <h3>Network Status</h3>
                        <p id="network-info">Loading...</p>
                    </div>
                    <div id="network-ping" style="margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <h3>Ping</h3>
                        <input type="text" id="ping-ip" placeholder="IP Address" style="width: 100%; margin-bottom: 10px; padding: 5px;">
                        <button onclick="pingIP()" style="padding: 5px 10px; background: #1e90ff; color: white; border: none;">Ping</button>
                        <div id="ping-output" style="margin-top: 10px; background: #000; color: #0f0; padding: 10px; font-family: monospace; height: 200px; overflow-y: auto;"></div>
                    </div>
                `,
                position: { top: 300, left: 300 },
                size: { width: 500, height: 400 },
                flex: true
            },
            {
                id: 'systemMonitorWindow',
                title: 'System Monitor',
                content: `
                    <div id="system-info" style="padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <h3>System Information</h3>
                        <p>CPU Usage: <span id="cpu-usage">Loading...</span></p>
                        <p>Memory Usage: <span id="memory-usage">Loading...</span></p>
                        <p>Disk Usage: <span id="disk-usage">Loading...</span></p>
                        <button onclick="updateSystemMonitor()" style="padding: 5px 10px; background: #1e90ff; color: white; border: none;">Refresh</button>
                    </div>
                `,
                position: { top: 350, left: 350 },
                size: { width: 400, height: 300 },
                flex: true
            },
            {
                id: 'timetableWindow',
                title: 'Timetable',
                content: `
                    <div id="timetable-content" style="padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <h3>Timetable Management</h3>
                        <button onclick="addTimetableEntry()" style="padding: 5px 10px; background: #28a745; color: white; border: none;">Add Entry</button>
                        <div id="timetable-list" style="margin-top: 10px; height: 300px; overflow-y: auto;"></div>
                    </div>
                `,
                position: { top: 400, left: 400 },
                size: { width: 400, height: 400 },
                flex: true
            }
        ];

        // This is the list of all dock icons. Each icon has a title, onclick action, and icon HTML.
        const dockIcons = [
            { title: 'Welcome Window', onclick: "openWindow('window1')", icon: '<img src="/static/images/logo.jpg" alt="LOGO" />' },
            { title: 'Note Window', onclick: "openWindow('noteWindow')", icon: '<img src="/static/images/note.svg" style="background-color:black;" alt="Note" />' },
            { title: 'WebDisk', onclick: "openWebDisk()", icon: '<img src="/static/images/webdisk.svg" alt="WebDisk" />' },
            { title: 'Calculator', onclick: "openWindow('calculatorWindow')", icon: '<img src="/static/images/calc.svg" alt="Calculator" />' },
            { title: 'Shell Terminal', onclick: "openWindow('shellWindow')", icon: '<img src="/static/images/shell.svg" alt="Shell" />' },
            { title: 'Network Tools', onclick: "openWindow('networkWindow')", icon: '<span style="font-size: 24px;">🌐</span>' },
            { title: 'System Monitor', onclick: "openWindow('systemMonitorWindow')", icon: '<span style="font-size: 24px;">📊</span>' },
            { title: 'Timetable', onclick: "openWindow('timetableWindow')", icon: '<span style="font-size: 24px;">📅</span>' }
        ];

        // This function creates all the windows on the desktop based on the windows list.
        function generateWindows() {
            const desktop = document.getElementById('desktop');
            windows.forEach(windowConfig => {
                const windowDiv = document.createElement('div');
                windowDiv.className = 'window';
                windowDiv.id = windowConfig.id;
                windowDiv.style.top = windowConfig.position.top + 'px';
                windowDiv.style.left = windowConfig.position.left + 'px';
                if (windowConfig.size) {
                    windowDiv.style.width = windowConfig.size.width + 'px';
                    windowDiv.style.height = windowConfig.size.height + 'px';
                }
                if (windowConfig.flex) {
                    windowDiv.style.flexDirection = 'column';
                }
                if (windowConfig.id !== 'window1') {
                    windowDiv.style.display = 'none';
                }
                windowDiv.innerHTML = `
                    <div class="window-header" onmousedown="startDrag(event, '${windowConfig.id}')">
                        <div class="window-controls">
                            <div class="window-control-button close" onclick="closeWindow('${windowConfig.id}')" title="Close"></div>
                            <div class="window-control-button minimize" onclick="minimizeWindow('${windowConfig.id}')" title="Minimize"></div>
                            <div class="window-control-button maximize" onclick="maximizeWindow('${windowConfig.id}')" title="Maximize"></div>
                        </div>
                        <div class="window-title">${windowConfig.title}</div>
                        <div style="width: 48px;"></div>
                    </div>
                    <div class="window-content">${windowConfig.content}</div>
                `;
                desktop.appendChild(windowDiv);
            });
        }

        // This function creates all the dock icons based on the dockIcons list.
        function generateDockIcons() {
            const dock = document.getElementById('dock');
            dockIcons.forEach(icon => {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'dock-icon';
                iconDiv.title = icon.title;
                iconDiv.onclick = new Function(icon.onclick);
                iconDiv.innerHTML = icon.icon;
                dock.appendChild(iconDiv);
            });
        }

        // This runs when the page loads. It generates all windows and dock icons.
        document.addEventListener('DOMContentLoaded', () => {
            generateWindows();
            generateDockIcons();
        });