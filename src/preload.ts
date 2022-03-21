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
  pasteClipboard: (index: number) => {
    ipcRenderer.send('paste:clipboard', index);
  },
  removeClipboard: (index: number) => {
    ipcRenderer.send('remove:clipboard', index);
  },
  showEditMenu: (pasteAction: () => void, removeAction: () => void) => {
    ipcRenderer.removeAllListeners('paste:edit-menu');
    ipcRenderer.removeAllListeners('remove:edit-menu');
    ipcRenderer.send('show:edit-menu');
    ipcRenderer.on('paste:edit-menu', pasteAction);
    ipcRenderer.on('remove:edit-menu', removeAction);
  },
  closeWindow: () => {
    ipcRenderer.send('close:window');
  },
});
