document.getElementById('saveDownloadBtn').addEventListener('click', () => {
    const content = document.getElementById('noteContent').value;
    if (!content) {
        alert('Please enter some note content before saving.');
        return;
    }
    const fileNameInput = document.getElementById('noteFileName');
    let fileName = '';
    if (fileNameInput) {
        fileName = fileNameInput.value.trim();
    }
    if (!fileName) {
        alert('Filename cannot be empty. Please enter a valid filename.');
        return false;
    }
    if (!fileName.toLowerCase().endsWith('.txt')) {
        fileName += '.txt';
    }

    // Encrypt content before saving
    const password = prompt('Enter encryption password:');
    if (!password) {
        alert('Encryption password is required.');
        return false;
    }
    const encrypted = CryptoJS.AES.encrypt(content, password).toString();

    // Use FileSaver.js library to save file with encrypted content
    if (typeof saveAs === 'function') {
        const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, fileName);
    } else {
        // Fallback to default method
        const blob = new Blob([encrypted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// Add decrypt functionality on load if file loaded (simulate)
document.getElementById('noteFileName').addEventListener('change', () => {
    const fileNameInput = document.getElementById('noteFileName');
    const fileName = fileNameInput.value.trim();
    if (!fileName) return;

    // Simulate loading encrypted content from localStorage (for demo)
    const encrypted = localStorage.getItem(fileName);
    if (!encrypted) return;

    const password = prompt('Enter decryption password:');
    if (!password) {
        alert('Decryption password is required.');
        return;
    }
    try {
        const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Decryption failed');
        document.getElementById('noteContent').value = decrypted;
    } catch (e) {
        alert('Failed to decrypt note. Wrong password or corrupted file.');
    }
});

// Save encrypted note to localStorage on save for demo loading
document.getElementById('saveDownloadBtn').addEventListener('click', () => {
    const content = document.getElementById('noteContent').value;
    const fileNameInput = document.getElementById('noteFileName');
    let fileName = '';
    if (fileNameInput) {
        fileName = fileNameInput.value.trim();
    }
    if (!fileName) return;

    const password = prompt('Enter encryption password:');
    if (!password) return;

    const encrypted = CryptoJS.AES.encrypt(content, password).toString();
    localStorage.setItem(fileName, encrypted);
});

// Load encrypted file
document.getElementById('loadBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('loadEncryptedFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to load.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const encrypted = e.target.result;
        const password = prompt('Enter decryption password:');
        if (!password) {
            alert('Decryption password is required.');
            return;
        }
        try {
            const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Decryption failed');
            document.getElementById('noteContent').value = decrypted;
            document.getElementById('noteFileName').value = file.name;
        } catch (e) {
            alert('Failed to decrypt file. Wrong password or corrupted file.');
        }
    };
    reader.readAsText(file);
});
