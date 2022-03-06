import { app, clipboard, ipcMain } from 'electron';
import clipboardListener from 'clipboard-event';
import { Clipboard } from '~/@types';
import robot from 'robotjs';

const histories: Clipboard[] = [];
app.whenReady().then(() => {
  clipboardListener.startListening();
  clipboardListener.on('change', () => {
    histories.push({
      time: Date.now(),
      text: clipboard.readText(),
      html: clipboard.readHTML(),
    });
  });
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
