// DEV CTRL!!
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  const orientationMsg = document.createElement('div');
  orientationMsg.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); color: white; display: flex; 
    flex-direction: column; justify-content: center; align-items: center; 
    font-size: 24px; z-index: 9999; text-align: center; padding: 20px;
    display: none;
  `;
  orientationMsg.innerHTML = `
    <p>Please rotate your device to landscape mode</p>
    <button id="closeRotateBtn" style="margin-top: 20px; padding: 10px 20px; 
      font-size: 18px; cursor: pointer;">Continue Anyway</button>
  `;
  document.body.appendChild(orientationMsg);

  const closeBtn = document.getElementById('closeRotateBtn');
  closeBtn.addEventListener('click', () => {
    orientationMsg.style.display = 'none';
  });

  const checkOrientation = () => {
    if (window.matchMedia("(orientation: portrait)").matches) {
      orientationMsg.style.display = 'flex';
    } else {
      orientationMsg.style.display = 'none';
    }
  };

  window.addEventListener('load', checkOrientation);
  window.matchMedia("(orientation: portrait)").addEventListener('change', checkOrientation);
}

// DEV CTRL!!

document.addEventListener('DOMContentLoaded', () => {    // Ensure dock exists and is centered before creating icons
    if (window.Charlex && window.Charlex.DOM && typeof window.Charlex.DOM.createModernDock === 'function') {
        try { window.Charlex.DOM.createModernDock(); } catch (err) { /* ignore */ }
    }
    // Create Welcome Window
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

    // Create CPU Monitor Window
    Charlex.DOM.createWindow('sysInfo', 'SYSINFO', `
        <div id="sysContent">
            <h3>CPU Usage</h3>
            <pre id="topOutput">Loading...</pre>
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
                <button id="goBtn" style="padding: 5px 10px;">Go</button>
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
        <div id="webdiskContent" style="padding: 10px; height: 400px; display: flex; flex-direction: column;">
            <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <button id="backBtn" style="padding: 5px 10px; margin-right: 5px;" disabled>Back</button>
                <button id="openDirBtn" style="padding: 5px 10px; margin-right: 5px;">Open Directory</button>
                <button id="newFileBtn" style="padding: 5px 10px; margin-right: 5px;">New File</button>
                <button id="newFolderBtn" style="padding: 5px 10px; margin-right: 5px;">New Folder</button>
                <button id="deleteBtn" style="padding: 5px 10px;">Delete</button>
            </div>
            <div id="currentDir" style="margin-bottom: 10px; font-weight: bold; padding: 5px; background: #f0f0f0;"></div>
            <table id="fileList" style="width: 100%; border-collapse: collapse;"
                <thead>
                    <tr lclass="table-header">
                        <th style="padding: 5px; text-align: left; width: 50px;"></th>
                        <th style="padding: 5px; text-align: left;">Name</th>
                        <th style="padding: 5px; text-align: left;">Size</th>
                        <th style="padding: 5px; text-align: left;">Modified</th>
                    </tr>
                </thead>
                <tbody class="bg-dark text-light"></tbody>
            </table>
        </div>
    `, '50%', '50%', 'none');

    // Re-initialize window manager after creating windows
    if (window.Charlex && window.Charlex.WindowManager && typeof window.Charlex.WindowManager.initWindowManager === 'function') {
        window.Charlex.WindowManager.initWindowManager();
    }

    // Create Dock Icons (use Charlex.DOM.showWindow wrapper where possible)
    Charlex.DOM.createDockIcon('Welcome Window', () => Charlex.DOM.showWindow('window1'), '<img src="img/logo.jpg" alt="LOGO" class="rounded-circle" style="width: 32px; height: 32px;" />', {tooltip: 'Welcome'});
    Charlex.DOM.createDockIcon('Note Window', () => Charlex.DOM.showWindow('noteWindow'), '<i class="fas fa-sticky-note" style="font-size: 32px;"></i>', {tooltip: 'Notes'});
    Charlex.DOM.createDockIcon('Libertarian Project', () => {
        console.log('Libertarian dock icon clicked');
        if (!document.getElementById('libertarianWindow')) {
            console.log('Creating Libertarian window');
            window.Charlex.LibertarianApp.create();
            console.log('Libertarian window created');
        }
        Charlex.DOM.showWindow('libertarianWindow');
        console.log('Libertarian window shown');
    }, '<i class="fas fa-balance-scale" style="font-size: 32px;"></i>', {tooltip: 'Libertarian Project'});
    Charlex.DOM.createDockIcon('CPU Monitor', () => Charlex.DOM.showWindow('sysInfo'), '<i class="fas fa-chart-line" style="font-size: 32px;"></i>', {tooltip: 'SYSTEM INFO'});
    Charlex.DOM.createDockIcon('Linux Shell', () => Charlex.DOM.showWindow('shellWindow'), '<i class="fas fa-terminal" style="font-size: 32px;"></i>', {tooltip: 'Shell'});
    Charlex.DOM.createDockIcon('Web Browser', () => Charlex.DOM.showWindow('browserWindow'), '<i class="fas fa-globe" style="font-size: 32px;"></i>', {tooltip: 'Browser'});
    Charlex.DOM.createDockIcon('WebDisk', () => Charlex.DOM.showWindow('webdiskWindow'), '<i class="fas fa-hdd" style="font-size: 32px;"></i>', {tooltip: 'WebDisk'});
});
