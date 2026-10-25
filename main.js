const { app, BrowserWindow, globalShortcut, screen, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');

let win, tray;
let isQuitting = false;

function createWindow() {
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 420,
    height: 560,
    x: sw - 440,
    y: 40,
    frame: false,             // borderless, sticky-note look
    transparent: true,        // transparent background -> rounded/frosted frame
    backgroundColor: '#00000000',
    hasShadow: true,
    vibrancy: 'hud',          // macOS frosted translucency behind the shell
    visualEffectState: 'active',
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    minimizable: false,
    fullscreenable: false,
    webPreferences: {
      partition: 'persist:claude-sticky',
      webviewTag: true,       // allow <webview> in index.html
      nodeIntegration: true,  // local trusted wrapper page uses ipcRenderer
      contextIsolation: false
    }
  });

  // Core feature: exclude from screen capture / screen share.
  // macOS -> NSWindowSharingNone ; Windows -> WDA_EXCLUDEFROMCAPTURE.
  win.setContentProtection(true);

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.loadFile('index.html');

  // Overall window translucency (fades everything, incl. Claude's page).
  win.setOpacity(0.78);

  win.on('close', (e) => {
    if (!isQuitting) { e.preventDefault(); win.hide(); } // closing just hides
  });
}

function toggle() {
  if (!win) return;
  win.isVisible() ? win.hide() : win.show();
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'iconTemplate.png'));
  icon.setTemplateImage(true); // adapts to light/dark menu bar on macOS
  tray = new Tray(icon);
  tray.setToolTip('Claude');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show / Hide', click: toggle },
    { type: 'separator' },
    { label: 'Quit Claude Sticky', click: () => { isQuitting = true; app.quit(); } }
  ]));
  tray.on('click', toggle);
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+C', toggle);

  // Adjust transparency on the fly.
  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    if (win) win.setOpacity(Math.min(1, win.getOpacity() + 0.08));
  });
  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    if (win) win.setOpacity(Math.max(0.25, win.getOpacity() - 0.08));
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on('win:hide', () => win && win.hide());
ipcMain.on('app:quit', () => { isQuitting = true; app.quit(); });

app.on('before-quit', () => { isQuitting = true; });
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
