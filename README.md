# Claude Sticky

A small, transparent, always-on-top desktop window that keeps Claude floating on your screen like a sticky note. Built with Electron, works on macOS and Windows.

## Features

- **Floating window** — frameless, always-on-top, stays above other apps
- **Transparent** — see-through window (adjustable opacity) with a draggable header
- **Draggable** — move it anywhere by the header bar
- **Tray icon** — show/hide or quit from the menu bar / system tray
- **Global hotkeys** — control it without focusing the window
- **Persistent login** — stays signed into Claude across restarts
- **Hidden from screen capture** — the window is excluded from screenshots, screen recordings, and screen-share on macOS (`NSWindowSharingNone`) and Windows (`WDA_EXCLUDEFROMCAPTURE`). See the note below.

## Hotkeys

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + Shift + C` | Show / hide the window |
| `Cmd/Ctrl + Shift + Up` | More opaque |
| `Cmd/Ctrl + Shift + Down` | More transparent |

## Run from source

Requires [Node.js](https://nodejs.org) 18+.

```bash
git clone https://github.com/chowpawan/cluely.git
cd cluely
npm install
npm start
```

## Build a distributable app

**macOS** (produces `dist/mac-arm64/Claude Sticky.app`):

```bash
npm run dist:mac
```

**Windows** (produces a portable `.exe` and installer — run this on a Windows machine for a fully polished build):

```bash
npm run dist:win
```

> Building the Windows `.exe` from an Apple-Silicon Mac partially works: the app is produced, but the final icon/metadata step needs Wine, which can't run on Apple Silicon. For a polished Windows build, build on Windows or via CI.

## Install the pre-built apps

**macOS (Apple Silicon):** unzip and double-click `Claude Sticky.app`.
First launch is blocked by Gatekeeper because the app is unsigned — **right-click the app → Open → Open**, or allow it under **System Settings → Privacy & Security**.

**Windows (x64):** unzip the whole folder and double-click `Claude Sticky.exe` inside it.
Keep every file in the folder together — the `.exe` needs the `.dll`/`.pak` files next to it.
Windows SmartScreen will warn that it's unsigned — click **More info → Run anyway**.

## Notes & limitations

- **Content protection is best-effort, not absolute.** It hides the window from normal software screen capture, but a physical camera pointed at the screen, a hardware HDMI capture device, or some low-level recorders can still see it. Behavior also varies by OS version.
- The **frosted-blur effect** is macOS-only; on Windows the window uses a semi-transparent dark frame instead.
- Claude's page renders its own background, so the content area is translucent via window opacity rather than fully see-through.
- Each person signs into **their own** Claude account; sessions are not shared.

## Tech

Electron, a `<webview>` loading `claude.ai`, and a handful of OS window APIs. Pre-built apps are packaged with [electron-builder](https://www.electron.build).
