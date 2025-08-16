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

    function executeCommand(cmd) {
        let output = '';
        switch (cmd.toLowerCase()) {
            case 'ls':
                output = 'Desktop  Documents  Downloads  Pictures  Videos';
                break;
            case 'pwd':
                output = '/home/user';
                break;
            case 'whoami':
                output = 'user';
                break;
            case 'date':
                output = new Date().toString();
                break;
            case 'echo':
                output = 'Hello, World!';
                break;
            case 'clear':
                shellContent.innerHTML = '<div>$ <input id="shellInput" type="text" style="background: transparent; border: none; color: green; outline: none; width: 90%;" /></div>';
                document.getElementById('shellInput').focus();
                return;
            default:
                output = `Command not found: ${cmd}`;
        }
        const newLine = document.createElement('div');
        newLine.textContent = output;
        shellContent.insertBefore(newLine, shellContent.lastElementChild);
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
