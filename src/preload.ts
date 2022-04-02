import { contextBridge, ipcRenderer } from 'electron';
import { Clipboard, WindowEventType } from '~/@types';

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
  showEditMenu: () => {
    ipcRenderer.send('show:edit-menu');
  },
  pressKey: (key: string, shiftKey: boolean) => {
    ipcRenderer.send('press:key', key, shiftKey);
  },
  closeWindow: () => {
    ipcRenderer.send('close:window');
  },
  storeWindowEvent: (
    action: (type: WindowEventType, ...args: unknown[]) => void
  ) => {
    ipcRenderer.on('store:window-event', (event, type, ...args) =>
      action(type, ...args)
    );
  },
});
