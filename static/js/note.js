document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveDownloadBtn');
    const fileNameInput = document.getElementById('noteFileName');
    const contentInput = document.getElementById('noteContent');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('loadEncryptedFile');

    if (!contentInput || !fileNameInput) return; // nothing to do

    function ensureCrypto() {
        if (typeof CryptoJS === 'undefined') {
            alert('CryptoJS not available. Encryption/decryption will not work.');
            return false;
        }
        return true;
    }

    // Single save handler (encrypt, download, and store to localStorage for demo)
    if (saveBtn) saveBtn.addEventListener('click', async () => {
        if (!ensureCrypto()) return;
        const content = contentInput.value || '';
        if (!content) { alert('Please enter some note content before saving.'); return; }
        let fileName = (fileNameInput.value || '').trim();
        if (!fileName) { alert('Filename cannot be empty.'); return; }
        if (!fileName.toLowerCase().endsWith('.txt')) fileName += '.txt';

        const password = prompt('Enter encryption password:');
        if (!password) { alert('Encryption password is required.'); return; }

        try {
            const encrypted = CryptoJS.AES.encrypt(content, password).toString();

            // download
            const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
            if (typeof saveAs === 'function') {
                saveAs(blob, fileName);
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }

            // store encrypted for demo convenience (optional)
            try { localStorage.setItem(fileName, encrypted); } catch (e) { /* ignore storage errors */ }

            // Offer to save the encrypted file into WebDisk (if available)
            try {
                if (window.Charlex && Charlex.FS) {
                    if (confirm('Also save the encrypted file into WebDisk?')) {
                        await Charlex.FS.writeFile(fileName, encrypted);
                        alert('Encrypted file saved to WebDisk.');
                    }
                }
            } catch (e) { /* ignore */ }
        } catch (e) {
            console.error(e);
            alert('Encryption failed.');
        }
    });

    // Load from localStorage when filename changed (demo)
    fileNameInput.addEventListener('change', async () => {
        if (!ensureCrypto()) return;
        const fileName = (fileNameInput.value || '').trim();
        if (!fileName) return;
        const encrypted = localStorage.getItem(fileName);
        if (!encrypted) return;
        const password = prompt('Enter decryption password:');
        if (!password) { alert('Decryption password is required.'); return; }
        try {
            const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Decryption failed');
            contentInput.value = decrypted;

            // Offer to save decrypted plaintext into WebDisk
            try {
                if (window.Charlex && Charlex.FS) {
                    if (confirm('Save decrypted plaintext into WebDisk?')) {
                        Charlex.FS.writeFile(fileName, decrypted).then(() => {
                            alert('Decrypted plaintext saved to WebDisk.');
                        }).catch(() => {});
                    }
                }
            } catch (e) { /* ignore */ }
        } catch (e) {
            alert('Failed to decrypt note. Wrong password or corrupted file.');
        }
    });

    // Load encrypted file from disk and decrypt
    if (loadBtn && fileInput) loadBtn.addEventListener('click', async () => {
        if (!ensureCrypto()) return;
        const file = fileInput.files[0];
        if (!file) { alert('Please select a file to load.'); return; }
        const reader = new FileReader();
    reader.onload = async (e) => {
            const encrypted = e.target.result;
            const password = prompt('Enter decryption password:');
            if (!password) { alert('Decryption password is required.'); return; }
                try {
                    const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
                    if (!decrypted) throw new Error('Decryption failed');
                    contentInput.value = decrypted;
                    fileNameInput.value = file.name;
                    // Offer to save uploaded raw file into WebDisk (raw encrypted content)
                    try {
                        if (window.Charlex && Charlex.FS) {
                            if (confirm('Upload the selected file (encrypted bytes) to WebDisk?')) {
                                // store the raw uploaded text (encrypted) into WebDisk
                                await Charlex.FS.writeFile(file.name, encrypted);
                                alert('File uploaded to WebDisk.');
                            }
                        }
                    } catch (e) { /* ignore */ }
            } catch (e) {
                alert('Failed to decrypt file. Wrong password or corrupted file.');
            }
        };
        reader.readAsText(file);
    });
});
