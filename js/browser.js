
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const goBtn = document.getElementById('goBtn');
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const browserFrame = document.getElementById('browserFrame');

    let history = [];
    let currentIndex = -1;

    function loadURL(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        browserFrame.src = url;
        urlInput.value = url;
        history = history.slice(0, currentIndex + 1);
        history.push(url);
        currentIndex = history.length - 1;
        updateButtons();
    }

    function updateButtons() {
        backBtn.disabled = currentIndex <= 0;
        forwardBtn.disabled = currentIndex >= history.length - 1;
    }

    goBtn.onclick = () => {
        const url = urlInput.value.trim();
        if (url) {
            loadURL(url);
        }
    };

    urlInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            goBtn.click();
        }
    };

    backBtn.onclick = () => {
        if (currentIndex > 0) {
            currentIndex--;
            browserFrame.src = history[currentIndex];
            urlInput.value = history[currentIndex];
            updateButtons();
        }
    };

    forwardBtn.onclick = () => {
        if (currentIndex < history.length - 1) {
            currentIndex++;
            browserFrame.src = history[currentIndex];
            urlInput.value = history[currentIndex];
            updateButtons();
        }
    };

    refreshBtn.onclick = () => {
        browserFrame.src = browserFrame.src;
    };

    // Load default page
    loadURL('https://www.google.com');
});

// Function to open Browser window
function openBrowserWindow() {
    const win = document.getElementById('browserWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
}
