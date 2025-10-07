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
        <div>Disk Usage: <span id="diskUsageText">0% used</span></div>
        <div style="width: 100%; height: 20px; background: #ccc; border-radius: 10px; overflow: hidden;">
            <div id="diskUsageBar" style="width: 0%; height: 100%; background: #28a745;"></div>
        </div>
    `;
    document.getElementById('webdiskContent').insertBefore(diskUsageDiv, document.getElementById('webdiskContent').firstElementChild);

    // Initialize FS
    if (!window.Charlex) window.Charlex = {};
    Charlex.FS = {
        fs: JSON.parse(localStorage.getItem('charlexFS') || '{"/":{"type":"dir","children":{}}}'),
        currentDir: '/',
        saveFS: function() {
            localStorage.setItem('charlexFS', JSON.stringify(this.fs));
        },
        getDir: function(path) {
            const parts = path.split('/').filter(p => p);
            let dir = this.fs['/'];
            for (const part of parts) {
                if (dir.children && dir.children[part] && dir.children[part].type === 'dir') {
                    dir = dir.children[part];
                } else {
                    return null;
                }
            }
            return dir;
        },
        ls: function(dirPath = this.currentDir) {
            const dir = this.getDir(dirPath);
            if (!dir) return [];
            return Object.keys(dir.children || {});
        },
        cd: function(path) {
            if (path === '..') {
                const parts = this.currentDir.split('/').filter(p => p);
                parts.pop();
                this.currentDir = '/' + parts.join('/');
                if (this.currentDir === '') this.currentDir = '/';
            } else if (path.startsWith('/')) {
                if (this.getDir(path)) {
                    this.currentDir = path;
                }
            } else {
                const newPath = this.currentDir === '/' ? '/' + path : this.currentDir + '/' + path;
                if (this.getDir(newPath)) {
                    this.currentDir = newPath;
                }
            }
        },
        mkdir: function(name) {
            const dir = this.getDir(this.currentDir);
            if (dir && !dir.children[name]) {
                dir.children[name] = { type: 'dir', children: {} };
                this.saveFS();
            }
        },
        touch: async function(name, content = '') {
            const dir = this.getDir(this.currentDir);
            if (dir && !dir.children[name]) {
                let url = '';
                if (content) {
                    url = await uploadToGofile(content, name);
                }
                dir.children[name] = { type: 'file', url: url };
                this.saveFS();
            }
        },
        rm: function(name) {
            const dir = this.getDir(this.currentDir);
            if (dir && dir.children[name]) {
                delete dir.children[name];
                this.saveFS();
            }
        },
        readFile: async function(name) {
            const dir = this.getDir(this.currentDir);
            if (dir && dir.children[name] && dir.children[name].type === 'file') {
                const url = dir.children[name].url;
                if (url) {
                    const response = await fetch(url);
                    return await response.text();
                }
                return '';
            }
            return null;
        },
        writeFile: async function(name, content) {
            const dir = this.getDir(this.currentDir);
            if (dir && dir.children[name] && dir.children[name].type === 'file') {
                const url = await uploadToGofile(content, name);
                dir.children[name].url = url;
                this.saveFS();
            }
        },
        rename: function(oldName, newName) {
            const dir = this.getDir(this.currentDir);
            if (dir && dir.children[oldName] && !dir.children[newName]) {
                dir.children[newName] = dir.children[oldName];
                delete dir.children[oldName];
                this.saveFS();
            }
        },
        getStats: function(name) {
            const dir = this.getDir(this.currentDir);
            if (dir && dir.children[name]) {
                const item = dir.children[name];
                return {
                    type: item.type,
                    size: item.url ? 'remote' : '0',
                    modified: 'N/A'
                };
            }
            return null;
        }
    };

    async function uploadToGofile(content, filename) {
        const formData = new FormData();
        const blob = new Blob([content], { type: 'text/plain' });
        formData.append('file', blob, filename);

        try {
            const response = await fetch('https://store1.gofile.io/uploadFile', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.status === 'ok') {
                return data.data.downloadPage;
            }
        } catch (e) {
            console.error('Upload failed:', e);
        }
        return '';
    }

    let selectedItem = null;
    let selectedRow = null;

    function loadFiles() {
        fileList.innerHTML = '';
        const items = Charlex.FS.ls();
        items.forEach(name => {
            const stats = Charlex.FS.getStats(name);
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            const isDir = stats.type === 'dir';
            row.innerHTML = `
                <td style="padding: 5px;">${isDir ? '📁' : '📄'}</td>
                <td style="padding: 5px;">${name}</td>
                <td style="padding: 5px;">${stats.size}</td>
                <td style="padding: 5px;">${stats.modified}</td>
            `;
            row.onclick = () => selectItem(name, row);
            row.ondblclick = () => isDir ? openSubDir(name) : openFile(name);
            fileList.appendChild(row);
        });
        currentDir.textContent = `Current Directory: ${Charlex.FS.currentDir}`;
        updateDiskUsage();
    }

    function selectItem(name, row) {
        if (selectedRow) {
            selectedRow.style.backgroundColor = '';
        }
        selectedRow = row;
        selectedRow.style.backgroundColor = 'rgba(0,123,255,0.3)';
        selectedItem = name;
    }

    async function openFile(name) {
        const content = await Charlex.FS.readFile(name);
        if (content !== null) {
            // Open in note window
            document.getElementById('noteFileName').value = name;
            document.getElementById('noteContent').value = content;
            openWindow('noteWindow');
        }
    }

    function openSubDir(name) {
        Charlex.FS.cd(name);
        loadFiles();
        backBtn.disabled = Charlex.FS.currentDir === '/';
    }

    function goBack() {
        Charlex.FS.cd('..');
        loadFiles();
        backBtn.disabled = Charlex.FS.currentDir === '/';
    }

    async function createFile() {
        const name = prompt('Enter file name:');
        if (name) {
            const content = prompt('Enter file content (leave empty for empty file):') || '';
            await Charlex.FS.touch(name, content);
            loadFiles();
        }
    }

    function createFolder() {
        const name = prompt('Enter folder name:');
        if (name) {
            Charlex.FS.mkdir(name);
            loadFiles();
        }
    }

    function deleteItem() {
        if (!selectedItem) {
            alert('No item selected.');
            return;
        }
        if (confirm(`Delete ${selectedItem}?`)) {
            Charlex.FS.rm(selectedItem);
            loadFiles();
            selectedItem = null;
            selectedRow = null;
        }
    }

    function renameItem() {
        if (!selectedItem) {
            alert('No item selected.');
            return;
        }
        const newName = prompt('Enter new name:', selectedItem);
        if (newName && newName !== selectedItem) {
            Charlex.FS.rename(selectedItem, newName);
            loadFiles();
            selectedItem = null;
            selectedRow = null;
        }
    }

    function updateDiskUsage() {
        const fsSize = JSON.stringify(Charlex.FS.fs).length;
        const usage = Math.min((fsSize / 5000000) * 100, 100); // Assume 5MB limit
        document.getElementById('diskUsageText').textContent = usage.toFixed(1) + '% used';
        document.getElementById('diskUsageBar').style.width = usage + '%';
    }

    backBtn.onclick = goBack;
    openDirBtn.style.display = 'none'; // Hide open dir button as it's virtual
    newFileBtn.onclick = createFile;
    newFolderBtn.onclick = createFolder;
    deleteBtn.onclick = deleteItem;
    renameBtn.onclick = renameItem;

    loadFiles();
});

// Function to open WebDisk window
function openWebDiskWindow() {
    Charlex.DOM.showWindow('webdiskWindow');
}
