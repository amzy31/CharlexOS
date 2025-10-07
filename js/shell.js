document.addEventListener('DOMContentLoaded', () => {
    const shellContent = document.getElementById('shellContent');
    const shellInput = document.getElementById('shellInput');

    shellInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const command = shellInput.value.trim();
            shellInput.value = '';
            await executeCommand(command);
        }
    });

    let connected = false;

    async function executeCommand(cmd) {
        let output = '';
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'ls':
                const items = Charlex.FS.ls();
                if (args.includes('-l')) {
                    output = items.map(name => {
                        const stats = Charlex.FS.getStats(name);
                        const type = stats.type === 'dir' ? 'd' : '-';
                        return `${type}rwxr-xr-x 1 user user 0 Jan 1 12:00 ${name}`;
                    }).join('\n');
                } else {
                    output = items.join(' ');
                }
                break;
            case 'pwd':
                output = Charlex.FS.currentDir;
                break;
            case 'whoami':
                output = 'user';
                break;
            case 'date':
                output = new Date().toString();
                break;
            case 'echo':
                const gtIndex = args.indexOf('>');
                if (gtIndex > 0 && args.length > gtIndex + 1) {
                    const content = args.slice(0, gtIndex).join(' ');
                    const filename = args[gtIndex + 1];
                    await Charlex.FS.writeFile(filename, content);
                    output = '';
                } else {
                    output = args.join(' ');
                }
                break;
            case 'mkdir':
                if (args.length > 0) {
                    Charlex.FS.mkdir(args[0]);
                    output = '';
                } else {
                    output = 'mkdir: missing operand';
                }
                break;
            case 'touch':
                if (args.length > 0) {
                    await Charlex.FS.touch(args[0]);
                    output = '';
                } else {
                    output = 'touch: missing operand';
                }
                break;
            case 'rm':
                if (args.length > 0) {
                    Charlex.FS.rm(args[0]);
                    output = '';
                } else {
                    output = 'rm: missing operand';
                }
                break;
            case 'cd':
                if (args.length > 0) {
                    Charlex.FS.cd(args[0]);
                    output = '';
                } else {
                    Charlex.FS.cd('/home/user');
                }
                break;
            case 'cat':
                if (args.length > 0) {
                    const content = await Charlex.FS.readFile(args[0]);
                    output = content !== null ? content : `cat: ${args[0]}: No such file or directory`;
                } else {
                    output = 'cat: missing operand';
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
            case 'top':
                output = Charlex.topOutput;
                break;
            case 'uname':
                output = 'Linux charlex-webos 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:33 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
                break;
            case 'ps':
                output = 'PID TTY          TIME CMD\n  1 ?        00:00:00 systemd\n  2 ?        00:00:00 kthreadd\n  3 ?        00:00:00 rcu_gp\n  4 ?        00:00:00 rcu_par_gp';
                break;
            case 'df':
                output = 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1       10000000 5000000  5000000  50% /';
                break;
            case 'clear':
                shellContent.innerHTML = '<div>$ <input id="shellInput" type="text" style="background: transparent; border: none; color: green; outline: none; width: 90%;" /></div>';
                const newShellInput = document.getElementById('shellInput');
                newShellInput.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        const command = newShellInput.value.trim();
                        newShellInput.value = '';
                        await executeCommand(command);
                    }
                });
                newShellInput.focus();
                return;
            case 'webdisk':
                openWebDiskWindow();
                output = 'Opening WebDisk...';
                break;
            case 'help':
                output = 'Available commands: ls, pwd, whoami, date, echo, mkdir, touch, rm, cd, cat, ssh, exit, top, uname, ps, df, clear, webdisk, help';
                break;
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
    Charlex.DOM.showWindow('shellWindow');
    document.getElementById('shellInput').focus();
}
