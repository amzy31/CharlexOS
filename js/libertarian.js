@l(function() {
    // Create Libertarian Donate App UI
    function createLibertarianApp() {
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.color = '#333';

        const title = document.createElement('h1');
        title.textContent = 'Personal Libertarian Project';
        container.appendChild(title);

        const description = document.createElement('p');
        description.textContent = 'Advocating for freedom, liberty, and individual rights.';
        container.appendChild(description);

        const aboutTitle = document.createElement('h2');
        aboutTitle.textContent = 'About Libertarianism';
        container.appendChild(aboutTitle);

        const aboutText = document.createElement('p');
        aboutText.textContent = 'Libertarianism is a political philosophy that upholds liberty as a core principle. Libertarians seek to maximize autonomy and political freedom, emphasizing free markets, civil liberties, and non-interventionism.';
        container.appendChild(aboutText);

        const principlesTitle = document.createElement('h3');
        principlesTitle.textContent = 'Key Principles';
        container.appendChild(principlesTitle);

        const principlesList = document.createElement('ul');
        ['Individual Liberty', 'Free Markets', 'Limited Government', 'Personal Responsibility'].forEach(principle => {
            const li = document.createElement('li');
            li.textContent = principle;
            principlesList.appendChild(li);
        });
        container.appendChild(principlesList);

        const donateBar = document.createElement('div');
        donateBar.style.position = 'fixed';
        donateBar.style.bottom = '0';
        donateBar.style.width = '100%';
        donateBar.style.backgroundColor = '#007bff';
        donateBar.style.color = 'white';
        donateBar.style.padding = '10px';
        donateBar.style.textAlign = 'center';
        donateBar.style.zIndex = '1000';

        const donateText = document.createElement('span');
        donateText.textContent = 'Support this project: Bitcoin Address - 1GeJAAGxiuRyzw7byVhgBGripYEeE9UWzM';
        donateBar.appendChild(donateText);

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy Address';
        copyBtn.style.marginLeft = '10px';
        copyBtn.className = 'btn btn-light btn-sm';
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
            const appWindow = window.Charlex.DOM.createWindow('libertarianWindow', 'Libertarian Project', '', '100px', '100px', 'none');
            const appContent = createLibertarianApp();
            const contentDiv = appWindow.querySelector('.window-content');
            contentDiv.innerHTML = '';
            contentDiv.appendChild(appContent);
            return appWindow;
        }
    };
})();
