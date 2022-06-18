import { contextBridge, ipcRenderer } from 'electron';
import { Clipboard, WindowEventType } from '~/@types';

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('api', {
  // clipboard
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
  // template
  saveTemplate: (title: string, text: string) => {
    ipcRenderer.send('save:template', title, text);
  },
  orderTemplate: () => {
    ipcRenderer.send('order:template');
  },
  deliverTemplate: (action: (templates: Template[]) => void) => {
    ipcRenderer.on('deliver:template', (event, templates) => action(templates));
  },
  pasteTemplate: (index: number) => {
    ipcRenderer.send('paste:template', index);
  },
  removeTemplate: (index: number) => {
    ipcRenderer.send('remove:template', index);
  },
  // window
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
