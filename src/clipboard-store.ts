import { app, clipboard, ipcMain } from 'electron';
import clipboardListener from 'clipboard-event';
import { Clipboard } from '~/@types';
import robot from 'robotjs';

const histories: Clipboard[] = [];
const upsertHistory = () => {
  const current = {
    time: Date.now(),
    text: clipboard.readText(),
    html: clipboard.readHTML(),
  };
  const same = histories.find(
    (item) => item.text === current.text && item.html === current.html
  );
  if (same) {
    // When exist same item, update timestamp
    same.time = current.time;
  } else {
    histories.push(current);
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
