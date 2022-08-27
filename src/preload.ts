import { contextBridge, ipcRenderer } from 'electron';
import {
  Clipboard,
  Template,
  WindowEventType,
  EditActions,
  Settings,
} from '~/@types';

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
  toggleFirstInFirstOutRepeat: () => {
    ipcRenderer.send('toggle:first-in-first-out-repeat');
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
  // settings
  getSettings: () => {
    return ipcRenderer
      .invoke('get:settings')
      .then((settings: Settings.items) => settings);
  },
  changeTheme: (theme: Settings.theme) => {
    ipcRenderer.send('change:theme', theme);
  },
  changeStartup: (startup: boolean) => {
    ipcRenderer.send('change:startup', startup);
  },
  closeSettings: () => {
    ipcRenderer.send('close:settings');
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
  showFirstInFirstOutMenu: (index: number) => {
    ipcRenderer.send('show:first-in-first-out-menu', index);
  },
  resizeSubWindow: (height: number) => {
    ipcRenderer.send('resize:sub-window', height);
  },
  closeSubWindow: () => {
    ipcRenderer.send('close:sub-window');
  },
});
