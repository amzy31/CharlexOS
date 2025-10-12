
let history = [];
let currentIndex = -1;

function loadURL(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    const browserFrame = document.getElementById('browserFrame');
    const urlInput = document.getElementById('urlInput');
    browserFrame.src = url;
    urlInput.value = url;
    history = history.slice(0, currentIndex + 1);
    history.push(url);
    currentIndex = history.length - 1;
    updateButtons();
}

function updateButtons() {
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    backBtn.disabled = currentIndex <= 0;
    forwardBtn.disabled = currentIndex >= history.length - 1;
}

function initBrowser() {
    const urlInput = document.getElementById('urlInput');
    const goBtn = document.getElementById('goBtn');
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const refreshBtn = document.getElementById('refreshBtn');

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
            const browserFrame = document.getElementById('browserFrame');
            browserFrame.src = history[currentIndex];
            urlInput.value = history[currentIndex];
            updateButtons();
        }
    };

    forwardBtn.onclick = () => {
        if (currentIndex < history.length - 1) {
            currentIndex++;
            const browserFrame = document.getElementById('browserFrame');
            browserFrame.src = history[currentIndex];
            urlInput.value = history[currentIndex];
            updateButtons();
        }
    };

    refreshBtn.onclick = () => {
        const browserFrame = document.getElementById('browserFrame');
        browserFrame.src = browserFrame.src;
    };

    // Load default page
    loadURL('https://www.google.com');
}

// Function to open Browser window
function openBrowserWindow() {
    const win = document.getElementById('browserWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
}

// Expose init function
window.Charlex = window.Charlex || {};
window.Charlex.Browser = {
    init: initBrowser
};

// Initialize browser if window is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser);
} else {
    initBrowser();
}
