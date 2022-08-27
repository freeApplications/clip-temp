import { app, ipcMain, nativeTheme } from 'electron';
import Store from 'electron-store';
import { Settings } from '~/@types';

const store = new Store();

const DEFAULT_SETTINGS: Settings.items = {
  theme: 'system',
  startup: false,
};

export const getSettings = (): Settings.items => {
  const settings = store.get('settings', {}) as Settings.items;
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
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
