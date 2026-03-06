import { app, BrowserWindow, ipcMain, protocol, screen, session } from 'electron';
import started from 'electron-squirrel-startup';
import path from 'node:path';
import { registerProtocols } from './protocol';
import type { RecordingResult } from '../src/types/index';
import { CH } from './channels';
import log from './lib/logger';
import { registerAppChannels } from './modules/app/channel';
import { runPreloadTasks } from './modules/app/service';
import { registerLibraryChannels } from './modules/library/channel';
import { registerRecordingChannels } from './modules/recording/channel';
import { registerSettingsChannels } from './modules/settings/channel';
import { registerSourcesChannels } from './modules/sources/channel';

log.initialize();

if (started) {
  app.quit();
}

// Must be called before app.ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'screenforge',
    privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true },
  },
]);

const PRELOAD_PATH = path.join(__dirname, 'preload.js');

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let toolbarWindow: BrowserWindow | null = null;

function loadURL(win: BrowserWindow, hash?: string): void {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = hash
      ? `${MAIN_WINDOW_VITE_DEV_SERVER_URL}#${hash}`
      : MAIN_WINDOW_VITE_DEV_SERVER_URL;
    win.loadURL(url);
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      hash ? { hash } : undefined,
    );
  }
}

function createSplashWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      sandbox: false,
    },
  });
  loadURL(win, 'splash');
  return win;
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    icon: path.join(__dirname, '../src/assets/logo.png'),
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      sandbox: false,
    },
  });
  loadURL(win);
  return win;
}

function createToolbarWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const W = 520;
  // Taller window so tooltips and the dropdown can render above the pill
  // within the Electron window bounds without being clipped.
  const H = 300;

  const win = new BrowserWindow({
    width: W,
    height: H,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    hasShadow: false,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Keep the pill's visual position the same as before (bottom of work area)
  // by aligning the window bottom edge to height - 28.
  win.setPosition(Math.round((width - W) / 2), height - (H + 28));

  // Follow the active desktop on all platforms
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'floating');
  // Exclude this window from all screen capture — toolbar controls must not
  // appear in the user's recording output.
  win.setContentProtection(true);

  loadURL(win, 'toolbar');
  return win;
}

app.on('ready', async () => {
  registerProtocols();

  // Allow screen capture permissions
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(true));
  session.defaultSession.setPermissionCheckHandler(() => true);

  splashWindow = createSplashWindow();
  mainWindow = createMainWindow();

  // Wait for splash renderer to be ready before sending progress
  await new Promise<void>((resolve) => {
    splashWindow?.webContents.once('did-finish-load', resolve);
  });

  await runPreloadTasks((progress) => {
    splashWindow?.webContents.send(CH.preload.PROGRESS, progress);
  });

  splashWindow.close();
  splashWindow = null;

  toolbarWindow = createToolbarWindow();

  registerSourcesChannels();
  registerRecordingChannels();
  registerSettingsChannels();
  registerLibraryChannels();
  registerAppChannels();
});

// ── Window-orchestration handler ──────────────────────────────────────────────
// Kept in main.ts because it directly manages BrowserWindow references.
ipcMain.on(CH.recording.FINISHED, (_event, data: RecordingResult) => {
  toolbarWindow?.close();
  toolbarWindow = null;
  mainWindow?.webContents.send(CH.recording.LOAD, data);
  mainWindow?.show();
});

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});
