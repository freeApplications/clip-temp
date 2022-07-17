import {
  app,
  clipboard,
  ipcMain,
  BrowserWindow,
  globalShortcut,
  IpcMainEvent,
} from 'electron';
import clipboardListener from 'clipboard-event';
import { Clipboard, PasteMode } from '~/@types';
import robot from 'robotjs';

let mode: PasteMode = 'normal';
export const isPasteMode = (modeOfArgs: PasteMode): boolean => {
  return mode === modeOfArgs;
};

const histories: Clipboard[] = [];
let recent: Clipboard | null = null;
function upsertHistory() {
  const current = {
    time: Date.now(),
    text: clipboard.readText(),
  };
  if (
    recent !== null &&
    current.time - recent.time <= 500 &&
    current.text !== recent.text &&
    (recent.text.startsWith(current.text) ||
      recent.text.endsWith(current.text) ||
      current.text.startsWith(recent.text) ||
      current.text.endsWith(recent.text))
  ) {
    // When within 500 ms from recent time and text is nearly equal, overwrite recent item
    Object.assign(recent, current);
    return;
  }
  insertFirstInFirstOut();
  const same = histories.find((item) => item.text === current.text);
  if (same) {
    // When exist same item, update timestamp
    same.time = current.time;
    recent = same;
  } else {
    histories.push(current);
    recent = current;
  }
}

let firstInFirstOut: string[] = [];
let repeat = false;
function insertFirstInFirstOut() {
  if (!isPasteMode('fifo')) {
    return;
  }
  const push = (!pasteByClipboard && !pasteByFirstInFirstOut) || repeat;
  if (pasteByClipboard || pasteByFirstInFirstOut) {
    pasteByClipboard = false;
    pasteByFirstInFirstOut = false;
    if (firstInFirstOut.length > 0) {
      takeoverPasteShortcut();
    }
  }
  if (push) {
    firstInFirstOut.push(clipboard.readText());
    takeoverPasteShortcut();
    deliverFirstInFirstOut();
  }
}

function deliverFirstInFirstOut() {
  const window = BrowserWindow.getAllWindows().find((window) =>
    window.isEnabled()
  );
  if (window) {
    window.webContents.send('deliver:first-in-first-out', firstInFirstOut);
  }
}

let pasteByClipboard = false;
export const pasteClipboard = (event: IpcMainEvent, text: string): void => {
  if (isPasteMode('fifo')) {
    pasteByClipboard = true;
    globalShortcut.unregister('Control+V');
  }
  clipboard.writeText(text);
  ipcMain.emit('close:main-window', event, () => {
    robot.keyTap('v', 'control');
  });
};

let pasteByFirstInFirstOut = false;
function takeoverPasteShortcut() {
  globalShortcut.register('Control+V', async () => {
    globalShortcut.unregister('Control+V');
    if (firstInFirstOut.length === 0) return;
    pasteByFirstInFirstOut = true;
    clipboard.writeText(firstInFirstOut.shift() as never);
    robot.keyToggle('control', 'down');
    robot.keyTap('v');
    deliverFirstInFirstOut();
  });
}

app.whenReady().then(() => {
  clipboardListener.startListening();
  clipboardListener.on('change', upsertHistory);
});

app.on('quit', () => {
  clipboardListener.stopListening();
});

ipcMain.on('order:clipboard', (event) => {
  event.sender.send('deliver:clipboard', histories);
});
ipcMain.on('paste:clipboard', (event, index: number) => {
  const { text } = histories[index];
  pasteClipboard(event, text);
});
ipcMain.on('remove:clipboard', (event, index: number) => {
  histories.splice(index, 1);
});
ipcMain.on('change:paste-mode:normal', () => {
  if (isPasteMode('normal')) return;
  mode = 'normal';
  globalShortcut.unregister('Control+V');
  ipcMain.emit('close:sub-window');
});
ipcMain.on('change:paste-mode:fifo', () => {
  if (isPasteMode('fifo')) return;
  mode = 'fifo';
  firstInFirstOut = [];
  repeat = false;
  ipcMain.emit('close:main-window');
  ipcMain.emit('show:sub-window');
});
ipcMain.on('toggle:first-in-first-out-repeat', () => {
  if (!isPasteMode('fifo')) return;
  repeat = !repeat;
});
