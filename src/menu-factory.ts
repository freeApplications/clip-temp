import {
  app,
  Menu,
  MenuItemConstructorOptions as MenuItemOptions,
  WebContents,
  ipcMain,
} from 'electron';
import path from 'path';
import { EditActions, PasteMode, Settings } from '~/@types';
import { isPasteMode, firstInFirstOutOperator } from './clipboard-store';
import { getSettings, changeTheme } from './settings-store';
import Internationalization from './internationalization';

const isDevelopment = process.env.NODE_ENV !== 'production';

let i18n: Internationalization;
const initialize = async () => {
  if (i18n) return;
  i18n = await Internationalization.factory(app.getLocale());
};

const createMenuTemplate = (sender: WebContents): MenuItemOptions[] => [
  {
    label: i18n.get('menu.file'),
    submenu: [
      {
        label: i18n.get('menu.settings'),
        accelerator: 'CommandOrControl+Alt+S',
        click: () => ipcMain.emit('show:settings'),
      },
      {
        label: i18n.get('menu.quit'),
        role: 'quit',
      },
    ],
  },
  {
    id: 'edit',
    label: i18n.get('menu.edit'),
    submenu: createEditMenuTemplate(sender),
  },
  {
    label: i18n.get('menu.view'),
    submenu: [
      {
        label: i18n.get('menu.reload'),
        accelerator: 'F5',
        click: () => sender.send('store:window-event', 'reload'),
      },
      {
        label: i18n.get('menu.toggleDevTools'),
        accelerator: 'F12',
        role: 'toggleDevTools',
      },
      { type: 'separator' },
      {
        label: i18n.get('menu.resetZoom'),
        accelerator: 'CommandOrControl+0',
        role: 'resetZoom',
      },
      {
        label: i18n.get('menu.zoomIn'),
        accelerator: 'CommandOrControl+Plus',
        role: 'zoomIn',
      },
      {
        label: i18n.get('menu.zoomOut'),
        accelerator: 'CommandOrControl+-',
        role: 'zoomOut',
      },
      { type: 'separator' },
      {
        label: i18n.get('menu.toggleFullscreen'),
        accelerator: 'F11',
        role: 'togglefullscreen',
      },
    ],
  },
  {
    label: i18n.get('menu.window'),
    submenu: [
      {
        id: 'theme',
        label: i18n.get('menu.theme'),
        submenu: createThemeMenuTemplate(),
      },
      {
        label: i18n.get('menu.minimize'),
        accelerator: 'CommandOrControl+M',
        role: 'minimize',
      },
      {
        label: i18n.get('menu.close'),
        accelerator: 'Esc',
        role: 'close',
      },
    ],
  },
  {
    label: i18n.get('menu.help'),
    submenu: [
      {
        label: i18n.get('menu.about', app.getName()),
        role: 'about',
      },
    ],
  },
];

const createEditMenuTemplate = (
  sender: WebContents,
  editable: EditActions[] = [],
  isContextMenu = false
): MenuItemOptions[] => [
  {
    id: 'mode',
    label: i18n.get('menu.mode'),
    submenu: createPasteModeMenuTemplate(),
    visible: editable.length === 0,
  },
  {
    id: 'paste',
    label: i18n.get('edit.paste'),
    accelerator: 'Enter',
    click: () => sender.send('store:window-event', 'paste'),
    enabled: editable.includes('paste'),
  },
  {
    id: 'add',
    label: i18n.get('edit.add'),
    click: () => sender.send('store:window-event', 'add'),
    enabled: editable.includes('add'),
    visible: !isContextMenu,
  },
  {
    id: 'edit',
    label: i18n.get('edit.edit'),
    click: () => sender.send('store:window-event', 'edit'),
    enabled: editable.includes('edit'),
  },
  {
    id: 'remove',
    label: i18n.get('edit.remove'),
    accelerator: 'Delete',
    click: () => sender.send('store:window-event', 'remove'),
    enabled: editable.includes('remove'),
  },
];

const createPasteModeMenuTemplate = (): MenuItemOptions[] => [
  {
    id: 'normal',
    label: i18n.get('mode.normal'),
    type: 'checkbox' as const,
    checked: isPasteMode('normal'),
    click: () => changePasteMode('normal'),
  },
  {
    id: 'fifo',
    label: i18n.get('mode.fifo'),
    type: 'checkbox' as const,
    checked: isPasteMode('fifo'),
    click: () => changePasteMode('fifo'),
  },
];

export const changePasteMode = (mode: PasteMode): void => {
  const menu = Menu.getApplicationMenu();
  if (menu === null) return;
  const pasteModeMenu = menu.getMenuItemById('mode');
  if (pasteModeMenu === null || !pasteModeMenu.submenu) return;
  pasteModeMenu.submenu.items.forEach((item) => {
    item.checked = mode === item.id;
  });
  ipcMain.emit(`change:paste-mode:${mode}`);
};

ipcMain.on('change:editable', (event, editable: EditActions[]) => {
  const menu = Menu.getApplicationMenu();
  if (menu === null) return;
  const editMenu = menu.getMenuItemById('edit');
  if (editMenu === null || !editMenu.submenu) return;
  editMenu.submenu.items.forEach((item) => {
    const { id } = item;
    if (id === 'mode') return;
    item.enabled = editable.includes(id as never);
  });
});

const changeThemMenu = (theme: Settings.theme): void => {
  changeTheme(theme);
  const menu = Menu.getApplicationMenu();
  if (menu === null) return;
  const themeMenu = menu.getMenuItemById('theme');
  if (themeMenu === null || themeMenu.submenu === undefined) return;
  themeMenu.submenu.items.forEach((item) => (item.checked = item.id === theme));
};

const createThemeMenuTemplate = (): MenuItemOptions[] => {
  const { theme } = getSettings();
  return [
    {
      id: 'system',
      label: i18n.get('settings.theme.options.system'),
      type: 'checkbox' as const,
      checked: theme === 'system',
      click: () => changeThemMenu('system'),
    },
    {
      id: 'light',
      label: i18n.get('settings.theme.options.light'),
      type: 'checkbox' as const,
      checked: theme === 'light',
      click: () => changeThemMenu('light'),
    },
    {
      id: 'dark',
      label: i18n.get('settings.theme.options.dark'),
      type: 'checkbox' as const,
      checked: theme === 'dark',
      click: () => changeThemMenu('dark'),
    },
  ];
};

export const createAppMenu = async (sender: WebContents): Promise<Menu> => {
  await initialize();
  app.setAboutPanelOptions({
    applicationName: app.getName(),
    applicationVersion: `Version: ${app.getVersion()}`,
    copyright: 'Copyright © 2022 gasu.dev',
    iconPath: isDevelopment
      ? 'public/icon.png'
      : path.join(__dirname, 'icon.png'),
  });
  return Menu.buildFromTemplate(createMenuTemplate(sender));
};

export const createEditMenu = (
  sender: WebContents,
  editable: EditActions[]
): Menu => {
  return Menu.buildFromTemplate(createEditMenuTemplate(sender, editable, true));
};

export const createPasteModeMenu = (): Menu => {
  return Menu.buildFromTemplate(createPasteModeMenuTemplate());
};

export const createFirstInFirstOutMenu = (index: number): Menu => {
  const { paste, move, remove, isLast } = firstInFirstOutOperator;
  return Menu.buildFromTemplate([
    {
      label: i18n.get('firstInFirstOut.paste'),
      click: paste,
      visible: index === 0,
    },
    {
      label: i18n.get('firstInFirstOut.remove'),
      click: () => remove(index),
    },
    {
      label: i18n.get('firstInFirstOut.first'),
      click: () => move(index, 0),
      visible: index > 0,
    },
    {
      label: i18n.get('firstInFirstOut.up'),
      click: () => move(index, index - 1),
      visible: index > 0,
    },
    {
      label: i18n.get('firstInFirstOut.down'),
      click: () => move(index, index + 1),
      visible: !isLast(index),
    },
  ]);
};
