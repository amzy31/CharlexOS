document.addEventListener('DOMContentLoaded', () => {
    // Create WebDisk Window
    const webdiskWindow = document.createElement('div');
    webdiskWindow.className = 'window';
    webdiskWindow.id = 'webdiskWindow';
    webdiskWindow.style.top = '300px';
    webdiskWindow.style.left = '300px';
    webdiskWindow.style.display = 'none';
    webdiskWindow.innerHTML = `
        <div class="window-header" onmousedown="startDrag(event, 'webdiskWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('webdiskWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('webdiskWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('webdiskWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">WebDisk</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" id="webdiskContent" style="padding: 10px; height: 400px; overflow-y: auto;">
            <div style="margin-bottom: 10px;">
                <button id="newFileBtn" style="padding: 5px 10px; margin-right: 5px;">New File</button>
                <button id="newFolderBtn" style="padding: 5px 10px; margin-right: 5px;">New Folder</button>
                <button id="deleteBtn" style="padding: 5px 10px;">Delete</button>
            </div>
            <div id="fileList" style="display: flex; flex-wrap: wrap;"></div>
        </div>
    `;
    document.getElementById('desktop').appendChild(webdiskWindow);

    const fileList = document.getElementById('fileList');
    const newFileBtn = document.getElementById('newFileBtn');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    function loadFiles() {
        fileList.innerHTML = '';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('webdisk_')) {
                const name = key.replace('webdisk_', '');
                const item = document.createElement('div');
                item.className = 'file-item';
                item.style.width = '80px';
                item.style.height = '80px';
                item.style.margin = '5px';
                item.style.display = 'flex';
                item.style.flexDirection = 'column';
                item.style.alignItems = 'center';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                    <div style="font-size: 40px;">📄</div>
                    <div style="font-size: 12px; text-align: center;">${name}</div>
                `;
                item.onclick = () => selectItem(key);
                item.ondblclick = () => openFile(key);
                fileList.appendChild(item);
            }
        }
    }

    let selectedItem = null;
    let selectedKey = null;

    function selectItem(key) {
        if (selectedItem) {
            selectedItem.style.backgroundColor = '';
        }
        selectedItem = event.target.closest('.file-item');
        selectedItem.style.backgroundColor = 'rgba(0,123,255,0.3)';
        selectedKey = key;
    }

    function openFile(key) {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return;
        const password = prompt('Enter password to open file:');
        if (!password) return;
        try {
            const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Decryption failed');
            // Open in note window
            document.getElementById('noteFileName').value = key.replace('webdisk_', '');
            document.getElementById('noteContent').value = decrypted;
            openWindow('noteWindow');
        } catch (e) {
            alert('Failed to open file. Wrong password.');
        }
    }

    newFileBtn.onclick = () => {
        const name = prompt('Enter file name:');
        if (name) {
            const content = prompt('Enter content:');
            const password = prompt('Enter encryption password:');
            if (password) {
                const encrypted = CryptoJS.AES.encrypt(content, password).toString();
                localStorage.setItem('webdisk_' + name, encrypted);
                loadFiles();
            }
        }
    };

    newFolderBtn.onclick = () => {
        alert('Folders not implemented yet. (Simulated)');
    };

    deleteBtn.onclick = () => {
        if (selectedKey) {
            const name = selectedKey.replace('webdisk_', '');
            if (confirm(`Delete ${name}?`)) {
                localStorage.removeItem(selectedKey);
                loadFiles();
                selectedItem = null;
                selectedKey = null;
            }
        } else {
            alert('No item selected.');
        }
    };

    loadFiles();
});

// Function to open WebDisk window
function openWebDiskWindow() {
    const win = document.getElementById('webdiskWindow');
    win.style.display = 'flex';
    win.style.zIndex = 1000;
}
