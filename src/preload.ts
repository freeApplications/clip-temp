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
  pasteClipboard: (index: number, asPlainText = false) => {
    ipcRenderer.send('paste:clipboard', index, asPlainText);
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
  pressKey: (key: string, shiftKey: boolean) => {
    ipcRenderer.send('press:key', key, shiftKey);
  },
  closeWindow: () => {
    ipcRenderer.send('close:window');
  },
});
