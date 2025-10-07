document.addEventListener('DOMContentLoaded', () => {
    // Simulate top command output
    let currentUsage = 20; // Starting usage

    if (!window.Charlex) window.Charlex = {};
    Charlex.topOutput = '';

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


        Charlex.topOutput = topOutput;
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
