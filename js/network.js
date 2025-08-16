document.addEventListener('DOMContentLoaded', () => {
    // Create Network Window
    const networkWindow = document.createElement('div');
    networkWindow.className = 'window';
    networkWindow.id = 'networkWindow';
    networkWindow.style.top = '250px';
    networkWindow.style.left = '250px';
    networkWindow.style.display = 'none';
    networkWindow.innerHTML = `
        <div class="window-header" onmousedown="startDrag(event, 'networkWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('networkWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('networkWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('networkWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">Distributed Network</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" id="networkContent">
            <h3>Connected Nodes</h3>
            <ul id="nodeList"></ul>
            <button id="addNodeBtn">Add Node</button>
            <button id="connectBtn">Connect to Network</button>
        </div>
    `;
    document.getElementById('desktop').appendChild(networkWindow);

    const nodeList = document.getElementById('nodeList');
    const addNodeBtn = document.getElementById('addNodeBtn');
    const connectBtn = document.getElementById('connectBtn');

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
