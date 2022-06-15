import { ipcMain } from 'electron';
import Store from 'electron-store';
import { Template } from '~/@types';

const store = new Store();
const templates: Template[] = (store.get('templates') as Template[]) || [];

ipcMain.on('save:template', (event, title: string, text: string) => {
  templates.push({
    time: Date.now(),
    title,
    text,
  });
  store.set('templates', templates);
});
