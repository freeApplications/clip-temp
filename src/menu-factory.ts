import {
  app,
  Menu,
  MenuItemConstructorOptions as MenuItemOptions,
  WebContents,
} from 'electron';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

const createMenuTemplate = (sender: WebContents): MenuItemOptions[] => [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        role: 'quit',
      },
    ],
  },
  {
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

const createEditMenuTemplate = (sender: WebContents): MenuItemOptions[] => [
  {
    label: 'Paste',
    accelerator: 'Enter',
    click: () => sender.send('store:window-event', 'paste'),
  },
  {
    label: 'Paste as Plain Text',
    click: () => sender.send('store:window-event', 'paste', true),
  },
  {
    label: 'Delete',
    accelerator: 'Delete',
    click: () => sender.send('store:window-event', 'remove'),
  },
];

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

export const createEditMenu = (sender: WebContents): Menu => {
  return Menu.buildFromTemplate(createEditMenuTemplate(sender));
};
