import {
  app,
  clipboard,
  ipcMain,
  BrowserWindow,
  globalShortcut,
  IpcMainEvent,
} from 'electron';
import clipboardListener from 'clipboard-event';
import Store from 'electron-store';
import { Clipboard, PasteMode } from '~/@types';
import { getSettings } from './settings-store';
import robot from 'robotjs';

const store = new Store();

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
  const index = histories.findIndex((item) => item.text === current.text);
  if (index > -1) {
    // When exist same item, remove from histories
    histories.splice(index, 1);
  }
  histories.push(current);
  recent = current;
  const overflow = histories.length - getSettings().clipboard.maxsize;
  if (overflow > 0) {
    histories.splice(0, overflow);
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
export const firstInFirstOutOperator = {
  paste: (): void => {
    ipcMain.emit(`blur:sub-window`);
    robot.keyTap('v', 'control');
  },
  move: (from: number, to: number): void => {
    const [text] = firstInFirstOut.splice(from, 1);
    firstInFirstOut.splice(to, 0, text);
    deliverFirstInFirstOut();
  },
  remove: (index: number): void => {
    firstInFirstOut.splice(index, 1);
    deliverFirstInFirstOut();
  },
  isLast: (index: number): boolean => index === firstInFirstOut.length - 1,
};

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
  if (getSettings().clipboard.backup) {
    const restoreHistories = store.get('clipboard', []) as Clipboard[];
    histories.splice(0, 0, ...restoreHistories);
  }
});

export const backup = (): void => {
  if (getSettings().clipboard.backup) {
    store.set('clipboard', histories);
  } else {
    store.delete('clipboard');
  }
};
app.on('quit', () => {
  // When multiple startup, nothing is done.
  if (clipboardListener.child === null) return;
  clipboardListener.stopListening();
  backup();
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
