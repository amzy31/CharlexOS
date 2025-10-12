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
    // Apply Bootstrap button classes for consistent UI
    const applyBtn = (el, cls) => { try { el.classList.add(...cls.split(' ')); } catch(e) {} };
    applyBtn(backBtn, 'btn btn-sm btn-secondary');
    applyBtn(openDirBtn, 'btn btn-sm btn-info');
    applyBtn(newFileBtn, 'btn btn-sm btn-primary');
    applyBtn(newFolderBtn, 'btn btn-sm btn-success');
    applyBtn(deleteBtn, 'btn btn-sm btn-danger');
    applyBtn(renameBtn, 'btn btn-sm btn-warning');
    renameBtn.style.marginLeft = '5px';
    document.getElementById('webdiskContent').querySelector('div').appendChild(renameBtn);

    // Disk usage display removed per UX request

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
            // create a file in current dir; store inline content when available
            const dir = this.getDir(this.currentDir);
            if (dir && !dir.children[name]) {
                const file = { type: 'file' };
                if (content) {
                    // store content directly to keep this offline-first
                    file.content = String(content);
                } else {
                    file.content = '';
                }
                dir.children[name] = file;
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
                const item = dir.children[name];
                if (typeof item.content === 'string') return item.content;
                const url = item.url;
                if (url) {
                    const response = await fetch(url);
                    return await response.text();
                }
                return '';
            }
            return null;
        },
        writeFile: async function(name, content) {
            // create file if missing, then write inline content (and optionally upload)
            const dir = this.getDir(this.currentDir);
            if (!dir) return;
            if (!dir.children[name]) {
                dir.children[name] = { type: 'file', content: String(content) };
                this.saveFS();
                return;
            }
            const item = dir.children[name];
            if (item.type !== 'file') return;
            // store inline content
            item.content = String(content);
            // keep URL-based upload as optional background action (do not require)
            try {
                // small best-effort upload; do not block
                uploadToGofile(content, name).then(url => {
                    if (url) item.url = url;
                    this.saveFS();
                }).catch(() => {});
            } catch (e) {}
            this.saveFS();
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
                let size = '0';
                if (typeof item.content === 'string') size = String(item.content.length);
                else if (item.url) size = 'remote';
                return {
                    type: item.type,
                    size: size,
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
            // Colorize rows: directories get a blue tint, files a neutral tint
            if (isDir) {
                row.classList.add('table-primary');
            } else {
        // row.classList.add('table-light');
            }
            const iconCell = document.createElement('td');
            iconCell.style.padding = '5px';
            iconCell.textContent = isDir ? '📁' : '📄';

            const nameCell = document.createElement('td');
            nameCell.style.padding = '5px';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            if (isDir) nameSpan.classList.add('text-primary');
            nameCell.appendChild(nameSpan);

            const sizeCell = document.createElement('td');
            sizeCell.style.padding = '5px';
            sizeCell.textContent = stats.size;

            const modCell = document.createElement('td');
            modCell.style.padding = '5px';
            modCell.textContent = stats.modified;

            row.appendChild(iconCell);
            row.appendChild(nameCell);
            row.appendChild(sizeCell);
            row.appendChild(modCell);

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
            // Prevent overwrite
            const dir = Charlex.FS.getDir(Charlex.FS.currentDir);
            if (dir && dir.children && dir.children[name]) { alert('file/directory exist'); return; }
            const content = prompt('Enter file content (leave empty for empty file):') || '';
            await Charlex.FS.touch(name, content);
            loadFiles();
        }
    }

    function createFolder() {
        const name = prompt('Enter folder name:');
        if (name) {
            const dir = Charlex.FS.getDir(Charlex.FS.currentDir);
            if (dir && dir.children && dir.children[name]) { alert('file/directory exist'); return; }
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
            const dir = Charlex.FS.getDir(Charlex.FS.currentDir);
            if (dir && dir.children && dir.children[newName]) { alert('file/directory exist'); return; }
            Charlex.FS.rename(selectedItem, newName);
            loadFiles();
            selectedItem = null;
            selectedRow = null;
        }
    }

    function updateDiskUsage() {
        const fsSize = JSON.stringify(Charlex.FS.fs).length;
        const usage = Math.min((fsSize / 5000000) * 100, 100); // Assume 5MB limit
        // The disk usage UI was removed; only update if elements exist to avoid errors
        const txt = document.getElementById('diskUsageText');
        const bar = document.getElementById('diskUsageBar');
        if (txt) txt.textContent = usage.toFixed(1) + '% used';
        if (bar) bar.style.width = usage + '%';
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
