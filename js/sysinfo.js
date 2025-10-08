document.addEventListener('DOMContentLoaded', () => {
    // Verbose system info
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const cookieEnabled = navigator.cookieEnabled;
    const onLine = navigator.onLine;
    const hardwareConcurrency = navigator.hardwareConcurrency || 'Unknown';

    const info = `
System Information:
- User-Agent: ${ua}
- Platform: ${platform}
- Language: ${language}
- Cookies Enabled: ${cookieEnabled}
- Online: ${onLine}
- CPU Cores: ${hardwareConcurrency}
    `.trim();

    console.log('System Info:', info);

    if (!window.Charlex) window.Charlex = {};
    Charlex.topOutput = info;

    const el = document.getElementById('topOutput');
    if (el) el.textContent = info;
});
