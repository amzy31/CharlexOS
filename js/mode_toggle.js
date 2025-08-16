document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'modeToggleBtn';
    toggleButton.textContent = 'Switch to Windows Mode';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.zIndex = '2000';
    toggleButton.style.padding = '8px 12px';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '4px';
    toggleButton.style.backgroundColor = '#0078D7';
    toggleButton.style.color = 'white';
    toggleButton.style.cursor = 'pointer';
    document.body.appendChild(toggleButton);

    let isMacOS = true;

    toggleButton.addEventListener('click', () => {
        const body = document.body;
        if (isMacOS) {
            // Switch to Windows mode
            body.classList.remove('macos-mode');
            body.classList.add('windows-mode');
            // Also update window headers to have windows-mode class
            document.querySelectorAll('.window-header').forEach(el => {
                el.classList.add('windows-mode');
                el.classList.remove('macos-mode');
            });
            toggleButton.textContent = 'Switch to macOS Mode';
            isMacOS = false;
        } else {
            // Switch to macOS mode
            body.classList.remove('windows-mode');
            body.classList.add('macos-mode');
            // Also update window headers to have macos-mode class
            document.querySelectorAll('.window-header').forEach(el => {
                el.classList.add('macos-mode');
                el.classList.remove('windows-mode');
            });
            toggleButton.textContent = 'Switch to Windows Mode';
            isMacOS = true;
        }
    });

    // Initialize with macOS mode class
    document.body.classList.add('macos-mode');
    document.querySelectorAll('.window-header').forEach(el => {
        el.classList.add('macos-mode');
    });
});
