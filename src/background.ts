'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray,
  Menu,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import './clipboard-store';
import './template-store';
import { createAppMenu, createEditMenu } from './menu-factory';
import robot from 'robotjs';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

let win: BrowserWindow | null;
async function createWindow() {
  if (win && !win.isDestroyed()) {
    win.webContents.send('store:window-event', 'reload');
    win.show();
    return;
  }
  // Create the browser window.
  win = new BrowserWindow({
    icon: path.join(__static, 'icon.png'),
    width: 800,
    height: 600,
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
  });
  Menu.setApplicationMenu(createAppMenu(win.webContents));
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    await win.loadURL('app://./index.html');
  }
  win.on('close', withoutCloseToHide);
}

const withoutCloseToHide = (event: Event) => {
  event.preventDefault();
  win?.minimize();
  win?.hide();
};

app.on('before-quit', () => {
  win?.removeListener('close', withoutCloseToHide);
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
  if (BrowserWindow.getAllWindows().length === 0) await createWindow();
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
});

let tray: Tray | null = null;
app.whenReady().then(() => {
  // Register global shortcut to show the window
  globalShortcut.register('CommandOrControl+Shift+V', createWindow);
  // Make tray icon wait in system's notification area
  tray = new Tray(path.join(__static, 'icon.png'));
  tray.setToolTip(app.getName());
  tray.on('click', createWindow);
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

ipcMain.on('show:edit-menu', (event) => {
  createEditMenu(event.sender).popup();
});
ipcMain.on('press:key', (event, key: string, shiftKey: boolean) => {
  try {
    shiftKey ? robot.keyTap(key, 'shift') : robot.keyTap(key);
  } catch (e) {
    console.log(e);
  }
});
ipcMain.on('close:window', (event, action?: () => void) => {
  if (action) {
    win?.once('hide', action);
  }
  win?.close();
});
