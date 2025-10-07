document.addEventListener('DOMContentLoaded', () => {
    // Create Welcome Window
    Charlex.DOM.createWindow('window1', 'Welcome', 'Welcome to the Charlex Web OS!', '50px', '50px');

    // Create Note Window
    Charlex.DOM.createWindow('noteWindow', 'Note (Encrypted)', `
        <form method="POST" action="/note" style="flex: 1; margin: 10px; display: flex; flex-direction: column;">
            <input id="noteFileName" name="noteFileName" type="text" placeholder="Enter filename (e.g. mynote.txt)" style="margin-bottom: 8px; padding: 6px 8px; border-radius: 8px; border: none; font-size: 14px;" />
            <textarea id="noteContent" name="noteContent" style="flex: 1; resize: none; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 8px; padding: 8px; font-size: 14px;" placeholder="Type your note here..."></textarea>
            <button type="button" id="saveDownloadBtn" style="margin-top: 8px; padding: 6px 12px; border: none; border-radius: 8px; background-color: #1e90ff; color: white; font-weight: bold; cursor: pointer;">Save Encrypted</button>
            <input type="file" id="loadEncryptedFile" accept=".txt" style="margin-top: 8px; padding: 6px 12px; border: none; border-radius: 8px; background-color: #28a745; color: white; font-weight: bold; cursor: pointer;" />
            <button type="button" id="loadBtn" style="margin-top: 8px; padding: 6px 12px; border: none; border-radius: 8px; background-color: #28a745; color: white; font-weight: bold; cursor: pointer;">Load Encrypted</button>
        </form>
    `, '100px', '100px', 'none');

    // Create CPU Monitor Window
    Charlex.DOM.createWindow('cpuWindow', 'CPU Monitor', `
        <div id="cpuContent">
            <h3>CPU Usage</h3>
            <pre id="topOutput">Loading top command...</pre>
        </div>
    `, '150px', '150px', 'none');

    // Create Shell Window
    Charlex.DOM.createWindow('shellWindow', 'Linux Shell', `
        <div id="shellContent" style="background: black; color: green; font-family: monospace; padding: 10px; height: 300px; overflow-y: auto;">
            <div>Welcome to Charlex WebOS Shell</div>
            <div>$ <input id="shellInput" type="text" style="background: transparent; border: none; color: green; outline: none; width: 90%;" /></div>
        </div>
    `, '200px', '200px', 'none');

    // Create Browser Window
    Charlex.DOM.createWindow('browserWindow', 'Web Browser', `
        <div id="browserContent" style="display: flex; flex-direction: column; height: 400px;">
            <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                <button id="backBtn">←</button>
                <button id="forwardBtn">→</button>
                <button id="refreshBtn">↻</button>
                <input id="urlInput" type="text" placeholder="Enter URL" style="flex: 1; padding: 5px;" />

            </div>
            <iframe id="browserFrame" src="" style="flex: 1; border: 1px solid #ccc;"></iframe>
        </div>
    `, '250px', '250px', 'none');
    // Create WebDisk Window
    Charlex.DOM.createWindow('webdiskWindow', 'WebDisk', `
        <div id="webdiskContent" style="padding: 10px; height: 400px; display: flex; flex-direction: column;">
            <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <button id="backBtn" style="padding: 5px 10px; margin-right: 5px;" disabled>Back</button>
                <button id="openDirBtn" style="padding: 5px 10px; margin-right: 5px;">Open Directory</button>
                <button id="newFileBtn" style="padding: 5px 10px; margin-right: 5px;">New File</button>
                <button id="newFolderBtn" style="padding: 5px 10px; margin-right: 5px;">New Folder</button>
                <button id="deleteBtn" style="padding: 5px 10px;">Delete</button>
            </div>
            <div id="currentDir" style="margin-bottom: 10px; font-weight: bold; padding: 5px; background: #f0f0f0;"></div>
            <table id="fileList" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e0e0e0;">
                        <th style="padding: 5px; text-align: left; width: 50px;"></th>
                        <th style="padding: 5px; text-align: left;">Name</th>
                        <th style="padding: 5px; text-align: left;">Size</th>
                        <th style="padding: 5px; text-align: left;">Modified</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `, '350px', '350px', 'none');

    // Create Dock Icons
    Charlex.DOM.createDockIcon('Welcome Window', () => openWindow('window1'), '<img src="img/logo.jpg" alt="LOGO" />');
    Charlex.DOM.createDockIcon('Note Window', () => openWindow('noteWindow'), '<img src="img/note.png" alt="Note" />');
    Charlex.DOM.createDockIcon('CPU Monitor', () => openCPUWindow(), '<span style="font-size: 20px;">📊</span>');
    Charlex.DOM.createDockIcon('Linux Shell', () => openShellWindow(), '<span style="font-size: 20px;">💻</span>');
    Charlex.DOM.createDockIcon('Web Browser', () => openBrowserWindow(), '<span style="font-size: 20px;">🌐</span>');
    Charlex.DOM.createDockIcon('WebDisk', () => openWebDiskWindow(), '<span style="font-size: 20px;">💾</span>');
});
