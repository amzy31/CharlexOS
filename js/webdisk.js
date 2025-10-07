document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('fileList').querySelector('tbody');
    const currentDir = document.getElementById('currentDir');
    const backBtn = document.getElementById('backBtn');
    const openDirBtn = document.getElementById('openDirBtn');
    const newFileBtn = document.getElementById('newFileBtn');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const renameBtn = document.createElement('button');
    renameBtn.textContent = 'Rename';
    renameBtn.style.padding = '5px 10px';
    renameBtn.style.marginLeft = '5px';
    document.getElementById('webdiskContent').querySelector('div').appendChild(renameBtn);

    // Add disk usage display
    const diskUsageDiv = document.createElement('div');
    diskUsageDiv.style.marginBottom = '10px';
    diskUsageDiv.innerHTML = `
        <div>Disk Usage: <span id="diskUsageText">50% used</span></div>
        <div style="width: 100%; height: 20px; background: #ccc; border-radius: 10px; overflow: hidden;">
            <div id="diskUsageBar" style="width: 50%; height: 100%; background: #28a745;"></div>
        </div>
    `;
    document.getElementById('webdiskContent').insertBefore(diskUsageDiv, document.getElementById('webdiskContent').firstElementChild);

    let dirHandle = null;
    let selectedHandle = null;
    let selectedRow = null;
    let dirStack = [];

    async function openDirectory() {
        try {
            dirHandle = await window.showDirectoryPicker();
            dirStack = [dirHandle];
            currentDir.textContent = `Current Directory: ${dirHandle.name}`;
            backBtn.disabled = true;
            await loadFiles();
        } catch (e) {
            alert('Failed to open directory: ' + e.message);
        }
    }

    async function loadFiles() {
        if (!dirHandle) return;
        fileList.innerHTML = '';
        for await (const [name, handle] of dirHandle.entries()) {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            const isDir = handle.kind === 'directory';
            let size = '-';
            let modified = '-';
            if (!isDir) {
                try {
                    const file = await handle.getFile();
                    size = formatSize(file.size);
                    modified = new Date(file.lastModified).toLocaleString();
                } catch (e) {
                    // ignore
                }
            }
            row.innerHTML = `
                <td style="padding: 5px;">${isDir ? '📁' : '📄'}</td>
                <td style="padding: 5px;">${name}</td>
                <td style="padding: 5px;">${size}</td>
                <td style="padding: 5px;">${modified}</td>
            `;
            row.onclick = () => selectItem(handle, row);
            row.ondblclick = () => isDir ? openSubDir(handle) : openFile(handle);
            fileList.appendChild(row);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function selectItem(handle, row) {
        if (selectedRow) {
            selectedRow.style.backgroundColor = '';
        }
        selectedRow = row;
        selectedRow.style.backgroundColor = 'rgba(0,123,255,0.3)';
        selectedHandle = handle;
    }

    async function openFile(handle) {
        try {
            const file = await handle.getFile();
            const content = await file.text();
            // Open in note window
            document.getElementById('noteFileName').value = handle.name;
            document.getElementById('noteContent').value = content;
            openWindow('noteWindow');
        } catch (e) {
            alert('Failed to open file: ' + e.message);
        }
    }

    async function openSubDir(handle) {
        dirStack.push(dirHandle);
        dirHandle = handle;
        currentDir.textContent = `Current Directory: ${handle.name}`;
        backBtn.disabled = false;
        await loadFiles();
    }

    function goBack() {
        if (dirStack.length > 1) {
            dirHandle = dirStack.pop();
            currentDir.textContent = `Current Directory: ${dirHandle.name}`;
            if (dirStack.length === 1) backBtn.disabled = true;
            loadFiles();
        }
    }

    async function createFile() {
        if (!dirHandle) {
            alert('No directory open.');
            return;
        }
        const name = prompt('Enter file name:');
        if (name) {
            try {
                const handle = await dirHandle.getFileHandle(name, { create: true });
                const writable = await handle.createWritable();
                await writable.write('');
                await writable.close();
                await loadFiles();
            } catch (e) {
                alert('Failed to create file: ' + e.message);
            }
        }
    }

    async function createFolder() {
        if (!dirHandle) {
            alert('No directory open.');
            return;
        }
        const name = prompt('Enter folder name:');
        if (name) {
            try {
                await dirHandle.getDirectoryHandle(name, { create: true });
                await loadFiles();
            } catch (e) {
                alert('Failed to create folder: ' + e.message);
            }
        }
    }

    async function deleteItem() {
        if (!selectedHandle) {
            alert('No item selected.');
            return;
        }
        const name = selectedHandle.name;
        if (confirm(`Delete ${name}?`)) {
            try {
                if (selectedHandle.kind === 'file') {
                    await dirHandle.removeEntry(name);
                } else {
                    await dirHandle.removeEntry(name, { recursive: true });
                }
                await loadFiles();
                selectedHandle = null;
                selectedRow = null;
            } catch (e) {
                alert('Failed to delete: ' + e.message);
            }
        }
    }

    async function renameItem() {
        if (!selectedHandle) {
            alert('No item selected.');
            return;
        }
        const newName = prompt('Enter new name:', selectedHandle.name);
        if (newName && newName !== selectedHandle.name) {
            try {
                await selectedHandle.move(newName);
                await loadFiles();
                selectedHandle = null;
                selectedRow = null;
            } catch (e) {
                alert('Failed to rename: ' + e.message);
            }
        }
    }

    backBtn.onclick = goBack;
    openDirBtn.onclick = openDirectory;
    newFileBtn.onclick = createFile;
    newFolderBtn.onclick = createFolder;
    deleteBtn.onclick = deleteItem;
    renameBtn.onclick = renameItem;
});

// Function to open WebDisk window
function openWebDiskWindow() {
    Charlex.DOM.showWindow('webdiskWindow');
}
