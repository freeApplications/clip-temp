import { app, clipboard, ipcMain } from 'electron';
import clipboardListener from 'clipboard-event';
import { Clipboard } from '~/@types';
import robot from 'robotjs';

const histories: Clipboard[] = [];
let recent: Clipboard | null = null;
const upsertHistory = () => {
  const current = {
    time: Date.now(),
    text: clipboard.readText(),
    html: clipboard.readHTML(),
  };
  if (
    recent !== null &&
    current.time - recent.time <= 500 &&
    (recent.text.startsWith(current.text) ||
      recent.text.endsWith(current.text) ||
      current.text.startsWith(recent.text) ||
      current.text.endsWith(recent.text))
  ) {
    // When within 500 ms from recent time and text is nearly equal, overwrite recent item
    Object.assign(recent, current);
    return;
  }
  const same = histories.find((item) => item.text === current.text);
  if (same) {
    // When exist same item, update timestamp
    same.time = current.time;
    recent = same;
  } else {
    histories.push(current);
    recent = current;
  }
};

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
  const item = histories[index];
  clipboard.write({
    text: item.text,
    html: item.html,
  });
  ipcMain.emit('close:window', event, () => {
    if (process.platform === 'win32') {
      robot.keyTap('v', 'control');
    } else {
      robot.keyTap('v', 'command');
    }
  });
});
ipcMain.on('remove:clipboard', (event, index: number) => {
  histories.splice(index, 1);
});
