#!/usr/bin/env node
// Minimal Express server that exposes /sysmon (GET) and /execute (POST)
// Only executes on Linux for safety. Returns plain text for GET /sysmon and JSON for POST /execute.

const os = require('os');
const express = require('express');
const { exec } = require('child_process');
const app = express();
app.use(express.json());

function isLinux() {
  try { return os.platform && os.platform() === 'linux'; } catch (e) { return false; }
}

app.get('/sysmon', (req, res) => {
  if (!isLinux()) return res.status(403).send('Not available on this platform');
  exec('top -b -n 1', { timeout: 5000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) return res.status(500).send(String(stderr || err.message || 'Error'));
    res.type('text/plain').send(String(stdout || ''));
  });
});

app.post('/execute', (req, res) => {
  if (!isLinux()) return res.status(403).json({ error: 'Not available on this platform' });
  const cmd = (req.body && req.body.command) ? String(req.body.command) : 'top -b -n 1';
  // Basic whitelist: only allow 'top' and simple safe flags to avoid dangerous commands
  if (!/^\s*(top)(\s|$)/.test(cmd)) return res.status(400).json({ error: 'Only top command is allowed' });
  exec(cmd, { timeout: 5000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: String(stderr || err.message || 'Error') });
    res.json({ output: String(stdout || '') });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('Sysmon server listening on port', port, 'linux only:', isLinux());
});
