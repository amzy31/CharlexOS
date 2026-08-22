document.addEventListener('DOMContentLoaded', () => {    // Ensure dock exists and is centered before creating icons
    if (window.Charlex && window.Charlex.DOM && typeof window.Charlex.DOM.createModernDock === 'function') {
      try { 
  window.Charlex.DOM.createModernDock('dock'); 
} catch (err) { 
  alert('The Charlex-Dock is not ready to use'); 
}   
    }
    // Create Welcome Window (Window1)
    Charlex.DOM.createWindow('window1', 'Welcome', `
        Welcome to the <span class="text-info"> CharleX WebOS!</span>`, '50px', '50px');

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

    // Create SysInfo Window
    Charlex.DOM.createWindow('sysInfo', 'SYSINFO', `
        <div id="sysContent">
            <h3>System information: </h3>
            <pre id="topOutput">Loading...</pre>
        </div>
    `, '150px', '150px', 'none');


    // Create Browser Window
    Charlex.DOM.createWindow('browserWindow', 'CharleX Browser', `
        <div id="browserContent" style="display: flex; flex-direction: column; height: 400px;">
            <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                <input class="bg-dark text-light" type="text" id="urlInput" placeholder="Enter URL" style="flex: 1; padding: 5px;" />
                <button class="btn btn-primary" id="goBtn" style="padding: 5px 10px;">Go</button>
            </div>
            <iframe id="browserFrame" src="" style="flex: 1; border: 1px solid #ccc;"></iframe>
        </div>
    `, '250px', '250px', 'none');
    // Initialize browser functionality
    if (window.Charlex && window.Charlex.Browser && typeof window.Charlex.Browser.init === 'function') {
        window.Charlex.Browser.init();
    }
    // Create WebDisk Window
    Charlex.DOM.createWindow('webdiskWindow', 'WebDisk', `
        <div id="webdiskContent" style="padding: 10px; height: 100%; display: flex; flex-direction: column;"
        class="bg-dark text-white">
            <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <button id="backBtn" style="padding: 5px 10px; margin-right: 5px;" disabled>Back</button>
                <button id="openDirBtn" style="padding: 5px 10px; margin-right: 5px;">Open Directory</button>
                <button id="newFileBtn" style="padding: 5px 10px; margin-right: 5px;">New File</button>
                <button id="newFolderBtn" style="padding: 5px 10px; margin-right: 5px;">New Folder</button>
                <button id="deleteBtn" style="padding: 5px 10px;">Delete</button>
            </div>
            <div   id="currentDir" style="margin-bottom: 10px; font-weight: bold; padding: 5px;" class="bg-dark"></div>
            <table id="fileList" class="table table-dark" style="width: 100%; border-collapse: collapse;">
                <thead class="bg-dark">
                    <tr class="table-header">
                        <th style="padding: 5px; text-align: left; width: 50px;"></th>
                        <th style="padding: 5px; text-align: left;">Name</th>
                        <th style="padding: 5px; text-align: left;">Size</th>
                        <th style="padding: 5px; text-align: left;">Modified</th>
                    </tr>
                </thead>
                <tbody class="container bg-dark  text-white" ></tbody>
            </table>
        </div>
    `, '50%', '50%', 'none');

    // Re-initialize window manager after creating windows
    if (window.Charlex && window.Charlex.WindowManager && typeof window.Charlex.WindowManager.initWindowManager === 'function') {
        window.Charlex.WindowManager.initWindowManager();
    }

    // Create Dock Icons (use Charlex.DOM.showWindow wrapper where possible)
    Charlex.DOM.createDockIcon('Welcome Window', () => Charlex.DOM.showWindow('window1'), '<img src="img/logo.jpg" alt="LOGO" class="rounded-circle" style="width: 32px; height: 32px;" />', {tooltip: 'Welcome'});
    Charlex.DOM.createDockIcon('Note Window', () => Charlex.DOM.showWindow('noteWindow'), '<img src="img/accessories-text-editor.svg" style="width: 32px; height: 32px;" />', {tooltip: 'Notes'});
    Charlex.DOM.createDockIcon('Libertarian Project', () => {
        console.log('Libertarian dock icon clicked');
        if (!document.getElementById('libertarianWindow')) {
            console.log('Creating Libertarian window');
            window.Charlex.LibertarianApp.create();
            console.log('Libertarian window created');
        }
        Charlex.DOM.showWindow('libertarianWindow');
        console.log('Libertarian window shown');
    }, '<img src="img/liberal.png" style="width: 32px; height: 32px;" />', {tooltip: 'Libertarian Project'});
    Charlex.DOM.createDockIcon('SysInfo', () => Charlex.DOM.showWindow('sysInfo'), '<img src="img/sysinfo.png" style="width: 32px; height: 32px;" />', {tooltip: 'SYSTEM INFO'});
    Charlex.DOM.createDockIcon('CharleX Browser', () => Charlex.DOM.showWindow('browserWindow'), '<img src="img/browser.png" style="width: 32px; height: 32px;" />', {tooltip: 'CharleX Browser'});
    Charlex.DOM.createDockIcon('WebDisk', () => Charlex.DOM.showWindow('webdiskWindow'), '<img src="img/file.png" style="width: 32px; height: 32px;" />', {tooltip: 'WebDisk'});
});
