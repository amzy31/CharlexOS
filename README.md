
# Charlex WebOS

Charlex WebOS is a small web desktop that runs in your browser. You can open windows, run apps, and use a dock.

You can host the site on any static host. If you want more features, you can run the optional server on Linux.

## Requirements

- A modern web browser (Chrome or Firefox).
- For real CPU monitoring you need a Linux host and Node.js.

## Quick notes

- Dock: styled in `css/style.css` with a skeuomorphic look.
- Notes app: the dock icon uses an inline glyph. No `img/note.png` is needed.
- Window manager: code is in `js/chrlex-dom.js` (no separate `window_manager.js`).

## Optional sysmon server (Linux only)

The `server/` folder has a small server that returns `top` output.

To run the server on a Linux host:

1. Open a terminal in the `server/` folder.
2. Run `npm install`.
3. Run `npm start` or `node sysmon.js`.

Endpoints:

- GET /sysmon — plain text output of `top -b -n 1`.
- POST /execute { "command": "top -b -n 1" } — JSON { output: string }.

The server only runs `top` and is for Linux only.

## Run the site locally

Start a simple static server and open the site in your browser:

```
python3 -m http.server
```

Open `http://localhost:8000` in your browser.

## Development notes

- Code: see the `js/` folder.
- Styles: `css/style.css`.
- Optional backend: `server/`.

## License

MIT License.

Copyright (c) 2020-2025 Amin Azimi AKA AMZY31

