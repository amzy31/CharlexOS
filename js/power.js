document.addEventListener('DOMContentLoaded', () => {
    // Add power icons to dock
    const dock = document.getElementById('dock');

    const powerOffIcon = document.createElement('div');
    powerOffIcon.className = 'dock-icon';
    powerOffIcon.title = 'Power Off';
    powerOffIcon.innerHTML = '<span style="font-size: 20px;">⏻</span>';
    powerOffIcon.onclick = () => {
        if (confirm('Are you sure you want to power off?')) {
            window.location.reload();
        }
    };
    dock.appendChild(powerOffIcon);

    const haltIcon = document.createElement('div');
    haltIcon.className = 'dock-icon';
    haltIcon.title = 'Halt';
    haltIcon.innerHTML = '<span style="font-size: 20px;">⏹</span>';
    haltIcon.onclick = () => alert('System halted. (Simulated)');
    dock.appendChild(haltIcon);
});
