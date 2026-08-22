document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('fileList')?.querySelector('tbody');
    const currentDir = document.getElementById('currentDir');
    const backBtn = document.getElementById('backBtn');
    const openDirBtn = document.getElementById('openDirBtn');
    const newFileBtn = document.getElementById('newFileBtn');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const webdiskContent = document.getElementById('webdiskContent');

    if (!fileList) {
        console.error('WebDisk: #fileList tbody not found');
        return;
    }

    /* =========================================================
       BUTTON SETUP
    ========================================================= */

    const renameBtn = document.createElement('button');
    renameBtn.textContent = 'Rename';

    const applyBtn = (el, cls) => {
        if (el) {
            el.classList.add(...cls.split(' '));
        }
    };

    applyBtn(backBtn, 'btn btn-sm btn-secondary');
    applyBtn(openDirBtn, 'btn btn-sm btn-info');
    applyBtn(newFileBtn, 'btn btn-sm btn-primary');
    applyBtn(newFolderBtn, 'btn btn-sm btn-success');
    applyBtn(deleteBtn, 'btn btn-sm btn-danger');
    applyBtn(renameBtn, 'btn btn-sm btn-warning');

    renameBtn.style.marginLeft = '5px';

    if (webdiskContent) {
        const toolbar = webdiskContent.querySelector('div');
        if (toolbar) {
            toolbar.appendChild(renameBtn);
        }
    }

    /* =========================================================
       FILE SYSTEM
    ========================================================= */

    if (!window.Charlex) {
        window.Charlex = {};
    }

    const defaultFS = {
        "/": {
            type: "dir",
            children: {}
        }
    };

    let storedFS;

    try {
        storedFS = JSON.parse(
            localStorage.getItem('charlexFS') ||
            JSON.stringify(defaultFS)
        );
    } catch (e) {
        console.warn('Invalid charlexFS, resetting filesystem.');
        storedFS = defaultFS;
    }

    Charlex.FS = {

        fs: storedFS,

        currentDir: '/',

        /* ---------------------------------------------
           EVENT SYSTEM
        --------------------------------------------- */

        events: new EventTarget(),

        emitChange() {
            this.events.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        path: this.currentDir
                    }
                })
            );
        },

        /* ---------------------------------------------
           SAVE
        --------------------------------------------- */

        saveFS() {
            localStorage.setItem(
                'charlexFS',
                JSON.stringify(this.fs)
            );

            // Tell WebDisk that filesystem changed
            this.emitChange();
        },

        /* ---------------------------------------------
           GET DIRECTORY
        --------------------------------------------- */

        getDir(path) {

            const parts = path
                .split('/')
                .filter(Boolean);

            let dir = this.fs['/'];

            for (const part of parts) {

                if (
                    dir.children &&
                    dir.children[part] &&
                    dir.children[part].type === 'dir'
                ) {
                    dir = dir.children[part];
                } else {
                    return null;
                }
            }

            return dir;
        },

        /* ---------------------------------------------
           LIST DIRECTORY
        --------------------------------------------- */

        ls(dirPath = this.currentDir) {

            const dir = this.getDir(dirPath);

            if (!dir) {
                return [];
            }

            return Object.keys(dir.children || {});
        },

        /* ---------------------------------------------
           CHANGE DIRECTORY
        --------------------------------------------- */

        cd(path) {

            if (path === '..') {

                const parts = this.currentDir
                    .split('/')
                    .filter(Boolean);

                parts.pop();

                this.currentDir =
                    '/' + parts.join('/');

                if (this.currentDir === '') {
                    this.currentDir = '/';
                }

                this.emitChange();
                return;
            }

            if (path.startsWith('/')) {

                if (this.getDir(path)) {
                    this.currentDir = path;
                    this.emitChange();
                }

                return;
            }

            const newPath =
                this.currentDir === '/'
                    ? '/' + path
                    : this.currentDir + '/' + path;

            if (this.getDir(newPath)) {

                this.currentDir = newPath;

                this.emitChange();
            }
        },

        /* ---------------------------------------------
           CREATE FOLDER
        --------------------------------------------- */

        mkdir(name) {

            const dir = this.getDir(this.currentDir);

            if (!dir) {
                return false;
            }

            if (dir.children[name]) {
                return false;
            }

            dir.children[name] = {
                type: 'dir',
                children: {}
            };

            this.saveFS();

            return true;
        },

        /* ---------------------------------------------
           CREATE FILE
        --------------------------------------------- */

        async touch(name, content = '') {

            const dir = this.getDir(this.currentDir);

            if (!dir) {
                return false;
            }

            if (dir.children[name]) {
                return false;
            }

            dir.children[name] = {
                type: 'file',
                content: String(content)
            };

            // Save immediately
            this.saveFS();

            return true;
        },

        /* ---------------------------------------------
           DELETE
        --------------------------------------------- */

        rm(name) {

            const dir = this.getDir(this.currentDir);

            if (!dir) {
                return false;
            }

            if (!dir.children[name]) {
                return false;
            }

            delete dir.children[name];

            this.saveFS();

            return true;
        },

        /* ---------------------------------------------
           READ FILE
        --------------------------------------------- */

        async readFile(name) {

            const dir = this.getDir(this.currentDir);

            if (
                dir &&
                dir.children[name] &&
                dir.children[name].type === 'file'
            ) {

                const item = dir.children[name];

                if (typeof item.content === 'string') {
                    return item.content;
                }

                if (item.url) {

                    try {

                        const response =
                            await fetch(item.url);

                        return await response.text();

                    } catch (error) {

                        console.error(
                            'Unable to read remote file:',
                            error
                        );

                    }
                }

                return '';
            }

            return null;
        },

        /* ---------------------------------------------
           WRITE FILE
        --------------------------------------------- */

        async writeFile(name, content) {

            const dir = this.getDir(this.currentDir);

            if (!dir) {
                return false;
            }

            if (!dir.children[name]) {

                dir.children[name] = {
                    type: 'file',
                    content: String(content)
                };

            } else {

                const item = dir.children[name];

                if (item.type !== 'file') {
                    return false;
                }

                item.content = String(content);
            }

            /*
             * IMPORTANT:
             * Save + emit immediately.
             *
             * The UI updates without page refresh.
             */

            this.saveFS();

            return true;
        },

        /* ---------------------------------------------
           RENAME
        --------------------------------------------- */

        rename(oldName, newName) {

            const dir = this.getDir(this.currentDir);

            if (!dir) {
                return false;
            }

            if (!dir.children[oldName]) {
                return false;
            }

            if (dir.children[newName]) {
                return false;
            }

            dir.children[newName] =
                dir.children[oldName];

            delete dir.children[oldName];

            this.saveFS();

            return true;
        },

        /* ---------------------------------------------
           FILE INFO
        --------------------------------------------- */

        getStats(name) {

            const dir = this.getDir(this.currentDir);

            if (
                dir &&
                dir.children[name]
            ) {

                const item = dir.children[name];

                let size = '0 B';

                if (typeof item.content === 'string') {

                    const bytes =
                        new Blob([item.content]).size;

                    if (bytes < 1024) {
                        size = `${bytes} B`;
                    } else if (bytes < 1024 * 1024) {
                        size =
                            `${(bytes / 1024).toFixed(1)} KB`;
                    } else {
                        size =
                            `${(bytes / 1024 / 1024).toFixed(1)} MB`;
                    }
                }

                return {
                    type: item.type,
                    size,
                    modified:
                        item.modified || 'Just now'
                };
            }

            return null;
        }
    };

    /* =========================================================
       REAL-TIME UI UPDATE
    ========================================================= */

    let renderTimer = null;

    function scheduleLoadFiles() {

        clearTimeout(renderTimer);

        renderTimer = setTimeout(() => {
            loadFiles();
        }, 0);
    }

    Charlex.FS.events.addEventListener(
        'change',
        scheduleLoadFiles
    );

    /* =========================================================
       LOAD FILES
    ========================================================= */

    function loadFiles() {

        fileList.innerHTML = '';

        const items = Charlex.FS.ls();

        items.forEach(name => {

            const stats =
                Charlex.FS.getStats(name);

            if (!stats) {
                return;
            }

            const row =
                document.createElement('tr');

            row.style.cursor = 'pointer';

            const isDir =
                stats.type === 'dir';

            /* ICON */

            const iconCell =
                document.createElement('td');

            iconCell.style.padding = '8px';

            iconCell.textContent =
                isDir ? '📁' : '📄';

            iconCell.classList.add(
                'text-info',
                'bg-dark'
            );

            /* NAME */

            const nameCell =
                document.createElement('td');

            nameCell.style.padding = '8px';

            nameCell.classList.add(
                'bg-dark'
            );

            const nameSpan =
                document.createElement('span');

            nameSpan.textContent = name;

            nameSpan.classList.add(
                'bg-dark'
            );

            if (isDir) {

                nameSpan.classList.add(
                    'text-info'
                );
            }

            nameCell.appendChild(nameSpan);

            /* SIZE */

            const sizeCell =
                document.createElement('td');

            sizeCell.style.padding = '8px';

            sizeCell.textContent =
                stats.size;

            sizeCell.classList.add(
                'bg-dark'
            );

            /* MODIFIED */

            const modCell =
                document.createElement('td');

            modCell.style.padding = '8px';

            modCell.textContent =
                stats.modified;

            modCell.classList.add(
                'bg-dark'
            );

            /* ROW */

            row.appendChild(iconCell);
            row.appendChild(nameCell);
            row.appendChild(sizeCell);
            row.appendChild(modCell);

            /* SELECT */

            row.onclick = () => {

                selectItem(
                    name,
                    row
                );
            };

            /* DOUBLE CLICK */

            row.ondblclick = () => {

                if (isDir) {
                    openSubDir(name);
                } else {
                    openFile(name);
                }
            };

            fileList.appendChild(row);
        });

        if (currentDir) {

            currentDir.textContent =
                `Current Directory: ${Charlex.FS.currentDir}`;
        }

        if (backBtn) {

            backBtn.disabled =
                Charlex.FS.currentDir === '/';
        }

        updateDiskUsage();
    }

    /* =========================================================
       SELECT
    ========================================================= */

    let selectedItem = null;
    let selectedRow = null;

    function selectItem(name, row) {

        if (selectedRow) {
            selectedRow.style.backgroundColor = '';
        }

        selectedRow = row;

        selectedRow.style.backgroundColor =
            'rgba(0,123,255,0.3)';

        selectedItem = name;
    }

    /* =========================================================
       OPEN FILE
    ========================================================= */

    async function openFile(name) {

        const content =
            await Charlex.FS.readFile(name);

        if (content === null) {
            return;
        }

        const filenameInput =
            document.getElementById('noteFileName');

        const contentInput =
            document.getElementById('noteContent');

        if (filenameInput) {
            filenameInput.value = name;
        }

        if (contentInput) {
            contentInput.value = content;
        }

        /*
         * Store the currently opened file.
         * Useful for live saving.
         */

        window.currentWebDiskFile = name;

        if (typeof openWindow === 'function') {
            openWindow('noteWindow');
        }
    }

    /* =========================================================
       OPEN DIRECTORY
    ========================================================= */

    function openSubDir(name) {

        Charlex.FS.cd(name);

        selectedItem = null;
        selectedRow = null;

        loadFiles();
    }

    /* =========================================================
       BACK
    ========================================================= */

    function goBack() {

        if (Charlex.FS.currentDir === '/') {
            return;
        }

        Charlex.FS.cd('..');

        selectedItem = null;
        selectedRow = null;

        loadFiles();
    }

    /* =========================================================
       CREATE FILE
    ========================================================= */

    async function createFile() {

        const name =
            prompt('Enter file name:');

        if (!name) {
            return;
        }

        const dir =
            Charlex.FS.getDir(
                Charlex.FS.currentDir
            );

        if (
            dir &&
            dir.children &&
            dir.children[name]
        ) {

            alert('File/folder already exists.');

            return;
        }

        const content =
            prompt(
                'Enter file content:'
            ) || '';

        const created =
            await Charlex.FS.touch(
                name,
                content
            );

        if (!created) {

            alert(
                'Unable to create file.'
            );

            return;
        }

        /*
         * NO PAGE REFRESH.
         *
         * saveFS() emitted change event,
         * which automatically calls loadFiles().
         */

        selectedItem = name;
    }

    /* =========================================================
       CREATE FOLDER
    ========================================================= */

    function createFolder() {

        const name =
            prompt('Enter folder name:');

        if (!name) {
            return;
        }

        const dir =
            Charlex.FS.getDir(
                Charlex.FS.currentDir
            );

        if (
            dir &&
            dir.children &&
            dir.children[name]
        ) {

            alert(
                'File/folder already exists.'
            );

            return;
        }

        const created =
            Charlex.FS.mkdir(name);

        if (!created) {

            alert(
                'Unable to create folder.'
            );

            return;
        }

        selectedItem = name;
    }

    /* =========================================================
       DELETE
    ========================================================= */

    function deleteItem() {

        if (!selectedItem) {

            alert(
                'No item selected.'
            );

            return;
        }

        if (
            !confirm(
                `Delete ${selectedItem}?`
            )
        ) {
            return;
        }

        const deleted =
            Charlex.FS.rm(
                selectedItem
            );

        if (!deleted) {
            return;
        }

        selectedItem = null;
        selectedRow = null;
    }

    /* =========================================================
       RENAME
    ========================================================= */

    function renameItem() {

        if (!selectedItem) {

            alert(
                'No item selected.'
            );

            return;
        }

        const newName =
            prompt(
                'Enter new name:',
                selectedItem
            );

        if (
            !newName ||
            newName === selectedItem
        ) {
            return;
        }

        const dir =
            Charlex.FS.getDir(
                Charlex.FS.currentDir
            );

        if (
            dir &&
            dir.children &&
            dir.children[newName]
        ) {

            alert(
                'File/folder already exists.'
            );

            return;
        }

        const oldName =
            selectedItem;

        const renamed =
            Charlex.FS.rename(
                oldName,
                newName
            );

        if (renamed) {

            selectedItem = newName;
            selectedRow = null;
        }
    }

    /* =========================================================
       DISK USAGE
    ========================================================= */

    function updateDiskUsage() {

        const fsSize =
            JSON.stringify(
                Charlex.FS.fs
            ).length;

        const usage =
            Math.min(
                (fsSize / 5000000) * 100,
                100
            );

        const txt =
            document.getElementById(
                'diskUsageText'
            );

        const bar =
            document.getElementById(
                'diskUsageBar'
            );

        if (txt) {

            txt.textContent =
                usage.toFixed(1) +
                '% used';
        }

        if (bar) {

            bar.style.width =
                usage + '%';
        }
    }

    /* =========================================================
       BUTTON EVENTS
    ========================================================= */

    if (backBtn) {
        backBtn.onclick = goBack;
    }

    if (openDirBtn) {
        openDirBtn.style.display = 'none';
    }

    if (newFileBtn) {
        newFileBtn.onclick = createFile;
    }

    if (newFolderBtn) {
        newFolderBtn.onclick = createFolder;
    }

    if (deleteBtn) {
        deleteBtn.onclick = deleteItem;
    }

    renameBtn.onclick = renameItem;

    /* =========================================================
       INITIAL RENDER
    ========================================================= */

    loadFiles();

    console.log(
        'Charlex WebDisk initialized ✓'
    );
});


/* =============================================================
   OPEN WEBDISK WINDOW
============================================================= */

const openWebDiskWindow = () => {

    if (
        window.Charlex &&
        Charlex.DOM &&
        typeof Charlex.DOM.showWindow === 'function'
    ) {

        Charlex.DOM.showWindow(
            'webdiskWindow'
        );
    }
};

