import { app, ipcMain, nativeTheme } from 'electron';
import Store from 'electron-store';
import { Settings } from '~/@types';

const store = new Store();

const DEFAULT_SETTINGS: Settings.items = {
  theme: 'system',
  startup: false,
  clipboard: {
    maxsize: 100,
    backup: false,
  },
};

export const getSettings = (): Settings.items => {
  const settings = store.get('settings', {}) as Settings.items;
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    clipboard: {
      ...DEFAULT_SETTINGS.clipboard,
      ...settings.clipboard,
    },
  };
};
type setSettings = {
  (key: 'theme', value: Settings.theme): void;
  (key: 'startup', value: boolean): void;
};
const setSettings: setSettings = (
  key: 'theme' | 'startup',
  value: string | boolean
) => {
  const settings = getSettings();
  if (settings[key] !== value) {
    store.set(`settings.${key}`, value);
  }
};
type setClipboardSettings = {
  (key: 'maxsize', value: number): void;
  (key: 'backup', value: boolean): void;
};
const setClipboardSettings: setClipboardSettings = (
  key: 'maxsize' | 'backup',
  value: number | boolean
) => {
  const { clipboard } = getSettings();
  if (clipboard[key] !== value) {
    store.set(`settings.clipboard.${key}`, value);
  }
};
export const changeTheme = (theme: Settings.theme): void => {
  nativeTheme.themeSource = theme;
  setSettings('theme', theme);
};
function changeStartup(startup: boolean) {
  if (process.env.NODE_ENV === 'production') {
    app.setLoginItemSettings({ openAtLogin: startup });
  }
  setSettings('startup', startup);
}

app.on('ready', async () => {
  const { theme } = getSettings();
  changeTheme(theme);
});

ipcMain.handle('get:settings', getSettings);
ipcMain.on('change:theme', (event, theme: Settings.theme) => {
  changeTheme(theme);
});
ipcMain.on('change:startup', (event, startup: boolean) => {
  changeStartup(startup);
});
ipcMain.on('change:clipboard-maxsize', (event, maxsize: number) => {
  setClipboardSettings('maxsize', maxsize);
});
ipcMain.on('change:clipboard-backup', (event, backup: boolean) => {
  setClipboardSettings('backup', backup);
});
