document.addEventListener('DOMContentLoaded', () => {
    // Simulate top command output
    let currentUsage = 20; // Starting usage

    function updateCPU() {
        // Fluctuate usage realistically
        const change = (Math.random() - 0.5) * 10; // Random change between -5 and 5
        currentUsage += change;
        currentUsage = Math.max(0, Math.min(100, currentUsage)); // Clamp between 0 and 100
        const usage = Math.floor(currentUsage);
        const idle = 100 - usage;

        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const up = '1 day, 1:00';
        const load = '0.00, 0.01, 0.05';

        const topOutput = `top - ${time} up ${up},  1 user,  load average: ${load}
Tasks: 100 total,   1 running,  99 sleeping,   0 stopped,   0 zombie
%Cpu(s): ${usage}.0 us,  0.0 sy,  0.0 ni, ${idle}.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1024.0 total,    512.0 free,    256.0 used,    256.0 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.    768.0 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
      1 root      20   0  123456   1234   1234 S   ${usage}.0  0.0   0:00.00 systemd
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

        document.getElementById('topOutput').textContent = topOutput;
    }

    setInterval(updateCPU, 2000);
    updateCPU(); // Initial call
});

// Function to open CPU window
function openCPUWindow() {
    const win = document.getElementById('cpuWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
}
