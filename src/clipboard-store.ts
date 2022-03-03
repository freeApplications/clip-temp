import { app, clipboard, ipcMain } from 'electron';
import clipboardListener from 'clipboard-event';
import { Clipboard } from '~/@types';

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