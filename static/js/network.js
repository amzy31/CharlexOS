document.addEventListener('DOMContentLoaded', () => {
    const nodeList = document.getElementById('nodeList');
    const addNodeBtn = document.getElementById('addNodeBtn');
    const connectBtn = document.getElementById('connectBtn');
    const urlInput = document.getElementById('urlInput');
    const browseBtn = document.getElementById('browseBtn');
    const networkBrowser = document.getElementById('networkBrowser');

    function loadNodes() {
        const nodes = JSON.parse(localStorage.getItem('charlexNodes') || '[]');
        nodeList.innerHTML = '';
        nodes.forEach(node => {
            const li = document.createElement('li');
            li.textContent = node;
            nodeList.appendChild(li);
        });
    }

    addNodeBtn.onclick = () => {
        const node = prompt('Enter node address:');
        if (node) {
            const nodes = JSON.parse(localStorage.getItem('charlexNodes') || '[]');
            nodes.push(node);
            localStorage.setItem('charlexNodes', JSON.stringify(nodes));
            loadNodes();
        }
    };

    browseBtn.onclick = () => {
        const url = urlInput.value.trim();
        if (url) {
            networkBrowser.src = url;
        }
    };

    connectBtn.onclick = () => {
        alert('Connected to distributed network! (Simulated)');
    };

    loadNodes();
});

// Function to open Network window
function openNetworkWindow() {
    const win = document.getElementById('networkWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
}
