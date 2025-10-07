(function() {
    window.Charlex = window.Charlex || {};
    window.Charlex.WindowManager = {};

    let dragData = {
        dragging: false,
        offsetX: 0,
        offsetY: 0,
        targetId: null,
    };

    window.Charlex.WindowManager.startDrag = function(e, id) {
        dragData.dragging = true;
        dragData.targetId = id;
        const target = document.getElementById(id);
        dragData.offsetX = e.clientX - target.offsetLeft;
        dragData.offsetY = e.clientY - target.offsetTop;
        document.body.style.userSelect = 'none';
    };

    window.addEventListener('mousemove', (e) => {
        if (!dragData.dragging) return;
        const target = document.getElementById(dragData.targetId);
        let newX = e.clientX - dragData.offsetX;
        let newY = e.clientY - dragData.offsetY;
        // Keep window inside viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - target.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - target.offsetHeight - 80)); // 80 for dock height + margin
        target.style.left = newX + 'px';
        target.style.top = newY + 'px';
    });

    window.addEventListener('mouseup', () => {
        dragData.dragging = false;
        document.body.style.userSelect = 'auto';
    });

    window.Charlex.WindowManager.closeWindow = function(id) {
        const win = document.getElementById(id);
        win.style.display = 'none'; // Simplified without jQuery
    };

    window.Charlex.WindowManager.minimizeWindow = function(id) {
        const win = document.getElementById(id);
        win.style.display = 'none';
    };

    window.Charlex.WindowManager.maximizeWindow = function(id) {
        const win = document.getElementById(id);
        if (win.classList.contains('maximized')) {
            // Restore
            win.style.top = win.dataset.prevTop;
            win.style.left = win.dataset.prevLeft;
            win.style.width = '300px';
            win.style.height = 'auto';
            win.classList.remove('maximized');
        } else {
            // Maximize
            win.dataset.prevTop = win.style.top;
            win.dataset.prevLeft = win.style.left;
            win.style.top = '0px';
            win.style.left = '0px';
            win.style.width = '100vw';
            win.style.height = 'calc(100vh - 80px)';
            win.classList.add('maximized');
        }
    };

    window.Charlex.WindowManager.openWindow = function(id) {
        const win = document.getElementById(id);
        win.style.display = 'flex'; // Simplified
        win.style.zIndex = 1000;
    };

    // Backward compatibility
    window.startDrag = window.Charlex.WindowManager.startDrag;
    window.closeWindow = window.Charlex.WindowManager.closeWindow;
    window.minimizeWindow = window.Charlex.WindowManager.minimizeWindow;
    window.maximizeWindow = window.Charlex.WindowManager.maximizeWindow;
    window.openWindow = window.Charlex.WindowManager.openWindow;
})();
