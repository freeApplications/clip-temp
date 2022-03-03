import { app, clipboard } from 'electron';
import clipboardListener from 'clipboard-event';

type Clipboard = {
  time: number;
  text: string;
  html: string;
};

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
