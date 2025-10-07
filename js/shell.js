document.addEventListener('DOMContentLoaded', () => {
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
            case 'top':
                // Simulate top command output
                let currentUsage = Math.floor(Math.random() * 100);
                const idle = 100 - currentUsage;
                const now = new Date();
                const time = now.toTimeString().split(' ')[0];
                const up = '1 day, 1:00';
                const load = '0.00, 0.01, 0.05';
                output = `top - ${time} up ${up},  1 user,  load average: ${load}
Tasks: 100 total,   1 running,  99 sleeping,   0 stopped,   0 zombie
%Cpu(s): ${currentUsage}.0 us,  0.0 sy,  0.0 ni, ${idle}.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1024.0 total,    512.0 free,    256.0 used,    256.0 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.    768.0 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
      1 root      20   0  123456   1234   1234 S   ${currentUsage}.0  0.0   0:00.00 systemd
      2 root      20   0  123456   1234   1234 S   0.0  0.0   0:00.00 kthreadd
      3 root       0 -20  123456   1234   1234 S   0.0  0.0   0:00.00 rcu_gp
      4 root       0 -20  123456   1234   1234 S   0.0  0.0   0:00.00 rcu_par_gp
      5 root      20   0       0      0      0 S   0.0  0.0   0:00.00 cpuhp/0
      6 root      20   0       0      0      0 S   0.0  0.0   0:00.00 kworker/0:0H
      7 root      20   0       0      0      0 S   0.0  0.0   0:00.00 mm_percpu_wq
      8 root      20   0       0      0      0 S   0.0  0.0   0:00.00 ksoftirqd/0
      9 root      20   0       0      0      0 S   0.0  0.0   0:00.00 rcu_sched
     10 root      20   0       0      0      0 S   0.0  0.0   0:00.00 migration/0
     11 root      20   0       0      0      0 S   0.0  0.0   0:00.00 watchdog/0
     12 root      20   0       0      0      0 S   0.0  0.0   0:00.00 cpuhp/1
     13 root      20   0       0      0      0 S   0.0  0.0   0:00.00 watchdog/1
     14 root      20   0       0      0      0 S   0.0  0.0   0:00.00 migration/1
     15 root      20   0       0      0      0 S   0.0  0.0   0:00.00 ksoftirqd/1
     16 root      20   0       0      0      0 S   0.0  0.0   0:00.00 kworker/1:0H
     17 root      20   0       0      0      0 S   0.0  0.0   0:00.00 cpuhp/2
     18 root      20   0       0      0      0 S   0.0  0.0   0:00.00 watchdog/2
     19 root      20   0       0      0      0 S   0.0  0.0   0:00.00 migration/2
     20 root      20   0       0      0      0 S   0.0  0.0   0:00.00 ksoftirqd/2
`;
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
    Charlex.DOM.showWindow('shellWindow');
    document.getElementById('shellInput').focus();
}
