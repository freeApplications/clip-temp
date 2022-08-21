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

const isDevelopment = process.env.NODE_ENV !== 'production';

const createMenuTemplate = (sender: WebContents): MenuItemOptions[] => [
  {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        accelerator: 'CommandOrControl+Alt+S',
        click: () => ipcMain.emit('show:settings'),
      },
      {
        label: 'Exit',
        role: 'quit',
      },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    submenu: createEditMenuTemplate(sender),
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'F5',
        click: () => sender.send('store:window-event', 'reload'),
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'F12',
        role: 'toggleDevTools',
      },
      { type: 'separator' },
      {
        label: 'Actual Size',
        accelerator: 'CommandOrControl+0',
        role: 'resetZoom',
      },
      {
        label: 'Zoom In',
        accelerator: 'CommandOrControl+Plus',
        role: 'zoomIn',
      },
      {
        label: 'Zoom Out',
        accelerator: 'CommandOrControl+-',
        role: 'zoomOut',
      },
      { type: 'separator' },
      {
        label: 'Toggle Full Screen',
        accelerator: 'F11',
        role: 'togglefullscreen',
      },
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        id: 'theme',
        label: 'Theme',
        submenu: createThemeMenuTemplate(),
      },
      {
        label: 'Minimize',
        accelerator: 'CommandOrControl+M',
        role: 'minimize',
      },
      {
        label: 'Close',
        accelerator: 'Esc',
        role: 'close',
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
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
    label: 'Mode',
    submenu: createPasteModeMenuTemplate(),
    visible: editable.length === 0,
  },
  {
    label: 'Paste',
    accelerator: 'Enter',
    click: () => sender.send('store:window-event', 'paste'),
    enabled: editable.includes('paste'),
  },
  {
    label: 'Add',
    click: () => sender.send('store:window-event', 'add'),
    enabled: editable.includes('add'),
    visible: !isContextMenu,
  },
  {
    label: 'Edit',
    click: () => sender.send('store:window-event', 'edit'),
    enabled: editable.includes('edit'),
  },
  {
    label: 'Delete',
    accelerator: 'Delete',
    click: () => sender.send('store:window-event', 'remove'),
    enabled: editable.includes('remove'),
  },
];

const createPasteModeMenuTemplate = (): MenuItemOptions[] => [
  {
    id: 'mode-normal',
    label: 'Normal',
    type: 'checkbox' as const,
    checked: isPasteMode('normal'),
    click: () => changePasteMode('normal'),
  },
  {
    id: 'mode-fifo',
    label: 'First-In First-Out',
    type: 'checkbox' as const,
    checked: isPasteMode('fifo'),
    click: () => changePasteMode('fifo'),
  },
];

export const changePasteMode = (mode: PasteMode): void => {
  const menu = Menu.getApplicationMenu();
  if (menu === null) return;
  for (const item of ['normal', 'fifo']) {
    const menuItem = menu.getMenuItemById(`mode-${item}`);
    if (menuItem === null) continue;
    menuItem.checked = mode === item;
  }
  ipcMain.emit(`change:paste-mode:${mode}`);
};

ipcMain.on('change:editable', (event, editable: EditActions[]) => {
  const menu = Menu.getApplicationMenu();
  if (menu === null) return;
  const editMenu = menu.getMenuItemById('edit');
  if (editMenu === null || !editMenu.submenu) return;
  editMenu.submenu.items.forEach((item) => {
    const label = item.label.toLowerCase();
    if (label === 'mode') return;
    item.enabled = editable.includes(label as never);
  });
});

const changeThemMenu = (theme: Settings.theme): void => {
  changeTheme(theme);
  const menu = Menu.getApplicationMenu();
  if (menu === null) return;
  const themeMenu = menu.getMenuItemById('theme');
  if (themeMenu === null || themeMenu.submenu === undefined) return;
  themeMenu.submenu.items.forEach(
    (item) => (item.checked = item.label.toLowerCase() === theme)
  );
};

const createThemeMenuTemplate = (): MenuItemOptions[] => {
  const { theme } = getSettings();
  return [
    {
      label: 'System',
      type: 'checkbox' as const,
      checked: theme === 'system',
      click: () => changeThemMenu('system'),
    },
    {
      label: 'Light',
      type: 'checkbox' as const,
      checked: theme === 'light',
      click: () => changeThemMenu('light'),
    },
    {
      label: 'Dark',
      type: 'checkbox' as const,
      checked: theme === 'dark',
      click: () => changeThemMenu('dark'),
    },
  ];
};

export const createAppMenu = (sender: WebContents): Menu => {
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
      label: 'Paste to delete',
      click: paste,
      visible: index === 0,
    },
    {
      label: 'Delete',
      click: () => remove(index),
    },
    {
      label: 'Move to first',
      click: () => move(index, 0),
      visible: index > 0,
    },
    {
      label: 'Up',
      click: () => move(index, index - 1),
      visible: index > 0,
    },
    {
      label: 'Down',
      click: () => move(index, index + 1),
      visible: !isLast(index),
    },
  ]);
};
