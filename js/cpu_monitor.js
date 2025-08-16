document.addEventListener('DOMContentLoaded', () => {
    // Create CPU Monitor Window
    const cpuWindow = document.createElement('div');
    cpuWindow.className = 'window';
    cpuWindow.id = 'cpuWindow';
    cpuWindow.style.top = '150px';
    cpuWindow.style.left = '150px';
    cpuWindow.style.display = 'none';
    cpuWindow.innerHTML = `
        <div class="window-header" onmousedown="startDrag(event, 'cpuWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('cpuWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('cpuWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('cpuWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">CPU Monitor</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" id="cpuContent">
            <h3>CPU Usage</h3>
            <div id="cpuUsage">Loading...</div>
            <canvas id="cpuChart" width="250" height="150"></canvas>
        </div>
    `;
    document.getElementById('desktop').appendChild(cpuWindow);

    // Simulate CPU usage
    let cpuData = [];
    const maxDataPoints = 20;
    const canvas = document.getElementById('cpuChart');
    const ctx = canvas.getContext('2d');

    function updateCPU() {
        const usage = Math.floor(Math.random() * 100);
        document.getElementById('cpuUsage').textContent = `${usage}%`;

        cpuData.push(usage);
        if (cpuData.length > maxDataPoints) cpuData.shift();

        // Draw chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1e90ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        cpuData.forEach((val, i) => {
            const x = (i / (maxDataPoints - 1)) * canvas.width;
            const y = canvas.height - (val / 100) * canvas.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
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
