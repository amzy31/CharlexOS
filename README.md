# Charlex WebOS

Charlex WebOS is a small web desktop. It runs in the browser.
It uses only HTML, CSS, and plain JavaScript. You can open windows and use a dock.

## Simple requirements

- A modern web browser (Chrome or Firefox is good).
- For real CPU monitoring you need a Linux host and Node.js to run the server.

## New notes (short)

- Dock: the dock now has a skeuomorphic look. It is styled in `css/style.css`.
- Notes app: the dock icon uses an inline glyph (emoji). The project no longer needs `img/note.png`.
- Window manager: code is merged into `js/chrlex-dom.js` (no separate `window_manager.js`).

## Sysmon server (optional, Linux only)

There is a small optional server in the `server/` folder. It can return the output of `top`.

To run the server on Linux:

1. Open a terminal in `server/` folder.
2. Run `npm install`.
3. Run `npm start` or `node sysmon.js`.

The server provides:

- GET /sysmon -> plain text output of `top -b -n 1`.
- POST /execute { "command": "top -b -n 1" } -> JSON { output: string }.

The server is safe by default. It only runs `top` and it only works on Linux.

## How to open the site

Use a static file server or open `index.html` in a browser. For local testing you can use:

```
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.

## Development notes

- Code: `js/` folder contains main scripts.
- Styles: `css/style.css` contains dock and window styles.
- Optional backend: `server/` folder.

## License

MIT License.

Copyright (c) 2020-2025 Amin Azimi AKA AMZY31

