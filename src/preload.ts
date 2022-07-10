import { contextBridge, ipcRenderer } from 'electron';
import { Clipboard, Template, WindowEventType, EditActions } from '~/@types';

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
  deliverFirstInFirstOut: (action: (firstInFirstOUt: string[]) => void) => {
    ipcRenderer.on('deliver:first-in-first-out', (event, firstInFirstOUt) =>
      action(firstInFirstOUt)
    );
  },
  // template
  saveTemplate: (index: number | string, title: string, text: string) => {
    ipcRenderer.send('save:template', index, title, text);
  },
  orderTemplate: () => {
    ipcRenderer.send('order:template');
  },
  deliverTemplate: (action: (templates: Template[]) => void) => {
    ipcRenderer.on('deliver:template', (event, templates) => action(templates));
  },
  getTemplate: (index: number) => {
    return ipcRenderer
      .invoke('get:template', index)
      .then((template: Template) => template);
  },
  pasteTemplate: (index: number) => {
    ipcRenderer.send('paste:template', index);
  },
  removeTemplate: (index: number) => {
    ipcRenderer.send('remove:template', index);
  },
  // window
  showEditMenu: (editable: EditActions[]) => {
    ipcRenderer.send('show:edit-menu', editable);
  },
  changeEditable: (editable: EditActions[]) => {
    ipcRenderer.send('change:editable', editable);
  },
  pressKey: (key: string, shiftKey: boolean) => {
    ipcRenderer.send('press:key', key, shiftKey);
  },
  closeMainWindow: () => {
    ipcRenderer.send('close:main-window');
  },
  storeWindowEvent: (
    action: (type: WindowEventType, ...args: unknown[]) => void
  ) => {
    ipcRenderer.on('store:window-event', (event, type, ...args) =>
      action(type, ...args)
    );
  },
  resizeSubWindow: (height: number) => {
    ipcRenderer.send('resize:sub-window', height);
  },
});
