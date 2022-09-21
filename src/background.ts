'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
  ipcMain,
  Tray,
  Menu,
  screen,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import { backup } from './clipboard-store';
import './template-store';
import { getSettings } from './settings-store';
import {
  createAppMenu,
  createEditMenu,
  createPasteModeMenu,
  changePasteMode,
  createFirstInFirstOutMenu,
} from './menu-factory';
import robot from 'robotjs';

// Prevent multiple startup
if (!app.requestSingleInstanceLock()) {
  console.log('Quit because it has already running...!');
  app.quit();
}

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

let mainWin: BrowserWindow | null;
async function createMainWindow() {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('store:window-event', 'reload');
    mainWin.show();
    return;
  }
  // Create the browser window.
  mainWin = createWindow();
  Menu.setApplicationMenu(createAppMenu(mainWin.webContents));
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    await mainWin.loadURL('app://./index.html');
  }
  mainWin.on('close', withoutCloseToHide);
  mainWin.on('session-end', backup);
}

function withoutCloseToHide(event: Event) {
  event.preventDefault();
  mainWin?.minimize();
  mainWin?.hide();
}

const SUB_WINDOW_WIDTH = 400;
let subWin: BrowserWindow | null;
let isMoved = false;
async function createSubWindow() {
  if (subWin && !subWin.isDestroyed()) return;
  // Create the browser window.
  subWin = createWindow({
    alwaysOnTop: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hidden',
    skipTaskbar: true,
  });
  subWin.removeMenu();
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await subWin.loadURL(
      process.env.WEBPACK_DEV_SERVER_URL + 'first-in-first-out'
    );
  } else {
    // Load the first-in-first-out.html when not in development
    await subWin.loadURL('app://./first-in-first-out.html');
  }
  subWin.on('moved', () => (isMoved = true));
  subWin.on('closed', () => changePasteMode('normal'));
}

function createWindow(options: BrowserWindowConstructorOptions = {}) {
  return new BrowserWindow({
    show: false,
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      // Required for Spectron testing
      enableRemoteModule: !!process.env.IS_TEST,

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,

      // Secure IPC communication
      preload: path.join(__dirname, 'preload.js'),
    },
    ...options,
  });
}

app.on('before-quit', () => {
  mainWin?.removeListener('close', withoutCloseToHide);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    // Run in the background
    // app.quit();
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) await createMainWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  await createMainWindow();
});

let tray: Tray | null = null;
app.whenReady().then(() => {
  // Register global shortcut to show the window
  globalShortcut.register('Control+Shift+V', createMainWindow);
  // Make tray icon wait in system's notification area
  tray = new Tray(path.join(__static, 'icon.png'));
  tray.setToolTip(app.getName());
  tray.on('click', createMainWindow);
  tray.on('right-click', () => createPasteModeMenu().popup());
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

ipcMain.on('show:edit-menu', (event, editable) => {
  createEditMenu(event.sender, editable).popup();
});
ipcMain.on('press:key', (event, key: string, shiftKey: boolean) => {
  try {
    shiftKey ? robot.keyTap(key, 'shift') : robot.keyTap(key);
  } catch (e) {
    console.log(e);
  }
});
ipcMain.on('close:main-window', (event, action?: () => void) => {
  if (mainWin && !mainWin.isDestroyed()) {
    if (action) {
      mainWin.once('hide', action);
    }
    if (mainWin.isVisible()) {
      mainWin.close();
    }
  }
});
ipcMain.on('show:sub-window', async () => {
  await createSubWindow();
});
ipcMain.on('show:first-in-first-out-menu', (event, index) => {
  createFirstInFirstOutMenu(index).popup();
});
ipcMain.on('resize-and-reposition:sub-window', (event, height) => {
  if (!subWin || subWin.isDestroyed()) return;
  if (height === undefined) [, height] = subWin.getSize();
  const { width, height: displayHeight } = screen.getPrimaryDisplay().workArea;
  if (isMoved) {
    subWin.setContentSize(SUB_WINDOW_WIDTH, height, true);
  } else {
    const bounds = {
      x: width - SUB_WINDOW_WIDTH,
      y: displayHeight - height,
      width: SUB_WINDOW_WIDTH,
      height,
    };
    const { position } = getSettings().firstInFirstOut;
    const [vertical, horizontal] = position.split('-');
    if (horizontal === 'left') {
      bounds.x = 0;
    } else if (horizontal === 'center') {
      bounds.x = (width - SUB_WINDOW_WIDTH) / 2;
    }
    if (vertical === 'top') {
      bounds.y = 0;
    }
    subWin.setContentBounds(bounds, true);
  }
  if (!subWin.isVisible()) {
    subWin.showInactive();
  }
});
ipcMain.on('blur:sub-window', () => {
  if (subWin && !subWin.isDestroyed()) {
    subWin.blur();
  }
});
ipcMain.on('close:sub-window', () => {
  if (subWin && !subWin.isDestroyed()) {
    subWin.close();
  }
  isMoved = false;
});
ipcMain.on('show:settings', () => {
  if (!mainWin || mainWin.isDestroyed()) return;
  mainWin.setMenuBarVisibility(false);
  mainWin.webContents.send('store:window-event', 'settings');
});
ipcMain.on('close:settings', () => {
  if (!mainWin || mainWin.isDestroyed()) return;
  mainWin.setMenuBarVisibility(true);
});
