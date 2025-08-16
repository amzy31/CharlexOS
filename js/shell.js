document.addEventListener('DOMContentLoaded', () => {
    // Create Shell Window
    const shellWindow = document.createElement('div');
    shellWindow.className = 'window';
    shellWindow.id = 'shellWindow';
    shellWindow.style.top = '200px';
    shellWindow.style.left = '200px';
    shellWindow.style.display = 'none';
    shellWindow.innerHTML = `
        <div class="window-header" onmousedown="startDrag(event, 'shellWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('shellWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('shellWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('shellWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">Linux Shell</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" id="shellContent" style="background: black; color: green; font-family: monospace; padding: 10px; height: 300px; overflow-y: auto;">
            <div>Welcome to Charlex WebOS Shell</div>
            <div>$ <input id="shellInput" type="text" style="background: transparent; border: none; color: green; outline: none; width: 90%;" /></div>
        </div>
    `;
    document.getElementById('desktop').appendChild(shellWindow);

    const shellContent = document.getElementById('shellContent');
    const shellInput = document.getElementById('shellInput');

    shellInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = shellInput.value.trim();
            shellInput.value = '';
            executeCommand(command);
        }
    });

    let currentDir = '/home/user';
    let connected = false;

    function executeCommand(cmd) {
        let output = '';
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'ls':
                if (args.includes('-l')) {
                    output = 'drwxr-xr-x 2 user user 4096 Jan 1 12:00 Desktop\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 Documents\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 Downloads\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 Pictures\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 Videos';
                } else {
                    output = 'Desktop  Documents  Downloads  Pictures  Videos';
                }
                break;
            case 'pwd':
                output = currentDir;
                break;
            case 'whoami':
                output = 'user';
                break;
            case 'date':
                output = new Date().toString();
                break;
            case 'echo':
                output = args.join(' ');
                break;
            case 'mkdir':
                if (args.length > 0) {
                    output = `Directory '${args[0]}' created.`;
                } else {
                    output = 'mkdir: missing operand';
                }
                break;
            case 'touch':
                if (args.length > 0) {
                    output = `File '${args[0]}' created.`;
                } else {
                    output = 'touch: missing operand';
                }
                break;
            case 'rm':
                if (args.length > 0) {
                    output = `File '${args[0]}' removed.`;
                } else {
                    output = 'rm: missing operand';
                }
                break;
            case 'cd':
                if (args.length > 0) {
                    currentDir = args[0].startsWith('/') ? args[0] : currentDir + '/' + args[0];
                    output = '';
                } else {
                    currentDir = '/home/user';
                }
                break;
            case 'ssh':
                if (args.length > 0) {
                    output = `Connecting to ${args[0]}... Connected. (Simulated SSH)`;
                    connected = true;
                } else {
                    output = 'ssh: missing host';
                }
                break;
            case 'exit':
                if (connected) {
                    output = 'Disconnected from SSH.';
                    connected = false;
                } else {
                    output = 'Not connected.';
                }
                break;
            case 'clear':
                shellContent.innerHTML = '<div>$ <input id="shellInput" type="text" style="background: transparent; border: none; color: green; outline: none; width: 90%;" /></div>';
                const newShellInput = document.getElementById('shellInput');
                newShellInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const command = newShellInput.value.trim();
                        newShellInput.value = '';
                        executeCommand(command);
                    }
                });
                newShellInput.focus();
                return;
            default:
                output = `Command not found: ${cmd}`;
        }
        if (output) {
            const newLine = document.createElement('div');
            newLine.textContent = output;
            shellContent.insertBefore(newLine, shellContent.lastElementChild);
        }
        shellContent.lastElementChild.scrollIntoView();
    }
});

// Function to open Shell window
function openShellWindow() {
    const win = document.getElementById('shellWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
    document.getElementById('shellInput').focus();
}
