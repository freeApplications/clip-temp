import { contextBridge, ipcRenderer } from 'electron';
import { Clipboard } from '~/@types';

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('api', {
  orderClipboard: () => {
    ipcRenderer.send('order:clipboard');
  },
  deliverClipboard: (action: (histories: Clipboard[]) => void) => {
    ipcRenderer.on('deliver:clipboard', (event, histories) =>
      action(histories)
    );
  },
});
