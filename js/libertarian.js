(function() {
    // Create Libertarian Donate App UI
    function createLibertarianApp() {
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.color = '#fff';
        container.style.backgroundColor = '#121212';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.7)';
        container.style.maxHeight = 'calc(100vh - 150px)';
        container.style.overflowY = 'auto';

        const title = document.createElement('h1');
        title.textContent = 'Personal Libertarian Project';
        title.style.color = '#fff';
        container.appendChild(title);

        const description = document.createElement('p');
        description.textContent = 'Advocating for freedom, liberty, and individual rights.';
        description.style.color = '#ccc';
        container.appendChild(description);

        const aboutTitle = document.createElement('h2');
        aboutTitle.textContent = 'About Libertarianism';
        aboutTitle.style.color = '#eee';
        container.appendChild(aboutTitle);

        const aboutText = document.createElement('p');
        aboutText.textContent = 'Libertarianism is a political philosophy that upholds liberty as a core principle. Libertarians seek to maximize autonomy and political freedom, emphasizing free markets, civil liberties, and non-interventionism.';
        aboutText.style.color = '#bbb';
        container.appendChild(aboutText);

        const principlesTitle = document.createElement('h3');
        principlesTitle.textContent = 'Key Principles';
        principlesTitle.style.color = '#eee';
        container.appendChild(principlesTitle);

        const principlesList = document.createElement('ul');
        ['Individual Liberty', 'Free Markets', 'Limited Government', 'Personal Responsibility'].forEach(principle => {
            const li = document.createElement('li');
            li.textContent = principle;
            li.style.marginBottom = '6px';
            li.style.color = '#ddd';
            principlesList.appendChild(li);
        });
        container.appendChild(principlesList);

        const donateBar = document.createElement('div');
        donateBar.style.position = 'relative';
        donateBar.style.marginTop = '20px';
        donateBar.style.width = '100%';
        donateBar.style.backgroundColor = '#1a1a1a';
        donateBar.style.color = 'white';
        donateBar.style.padding = '12px 20px';
        donateBar.style.textAlign = 'center';
        donateBar.style.borderRadius = '6px';
        donateBar.style.display = 'flex';
        donateBar.style.justifyContent = 'center';
        donateBar.style.alignItems = 'center';
        donateBar.style.gap = '10px';
        donateBar.style.fontWeight = 'bold';

        const donateText = document.createElement('span');
        donateText.textContent = 'Bitcoin Address - 1GeJAAGxiuRyzw7byVhgBGripYEeE9UWzM';
        donateBar.appendChild(donateText);

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy Address';
        copyBtn.style.marginLeft = '10px';
        copyBtn.className = 'btn btn-light btn-sm';
        copyBtn.style.cursor = 'pointer';
        copyBtn.onclick = () => {
            const address = '1GeJAAGxiuRyzw7byVhgBGripYEeE9UWzM';
            navigator.clipboard.writeText(address).then(() => {
                alert('Bitcoin address copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        };
        donateBar.appendChild(copyBtn);

        container.appendChild(donateBar);

        return container;
    }

    // Expose function to open Libertarian app window
    window.Charlex = window.Charlex || {};
    window.Charlex.LibertarianApp = {
        create: function() {
            console.log('LibertarianApp.create called');
            const appWindow = window.Charlex.DOM.createWindow('libertarianWindow', 'Libertarian Project', '', '100px', '100px', 'none');
            console.log('Window created:', appWindow);
            const appContent = createLibertarianApp();
            console.log('App content created:', appContent);
            const contentDiv = appWindow.querySelector('.window-content');
            console.log('Content div found:', contentDiv);
            contentDiv.innerHTML = '';
            contentDiv.appendChild(appContent);
            return appWindow;
        }
    };
})();
