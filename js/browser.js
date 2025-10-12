
function loadURL(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    const browserFrame = document.getElementById('browserFrame');
    const urlInput = document.getElementById('urlInput');
    browserFrame.src = url;
    urlInput.value = url;
}

function initBrowser() {
    const urlInput = document.getElementById('urlInput');
    const goBtn = document.getElementById('goBtn');

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
