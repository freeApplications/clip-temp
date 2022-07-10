import { ipcMain } from 'electron';
import Store from 'electron-store';
import { pasteClipboard } from './clipboard-store';
import { Template } from '~/@types';

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
  pasteClipboard(event, template.text);
  template.time = Date.now();
  store.set('templates', templates);
});
ipcMain.on('remove:template', (event, index: number) => {
  templates.splice(index, 1);
  store.set('templates', templates);
});
