import { clipboard, ipcMain } from 'electron';
import Store from 'electron-store';
import { Template } from '~/@types';
import robot from 'robotjs';

const store = new Store();
const templates: Template[] = (store.get('templates') as Template[]) || [];

ipcMain.on(
  'save:template',
  (event, index: number | string, title: string, text: string) => {
    const template = {
      time: Date.now(),
      title,
      text,
    };
    if (typeof index === 'number') {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    store.set('templates', templates);
  }
);
ipcMain.on('order:template', (event) => {
  event.sender.send('deliver:template', templates);
});
ipcMain.handle('get:template', (event, index) => {
  return templates[index];
});
ipcMain.on('paste:template', (event, index: number) => {
  const template = templates[index];
  clipboard.writeText(template.text);
  ipcMain.emit('close:window', event, () => {
    if (process.platform === 'win32') {
      robot.keyTap('v', 'control');
    } else {
      robot.keyTap('v', 'command');
    }
  });
  template.time = Date.now();
  store.set('templates', templates);
});
ipcMain.on('remove:template', (event, index: number) => {
  templates.splice(index, 1);
  store.set('templates', templates);
});
