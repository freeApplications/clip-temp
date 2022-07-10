export type ClipTemp = Clipboard | Template;

export type Clipboard = {
  time: number;
  text: string;
};

export type Template = {
  time: number;
  title: string;
  text: string;
};

export type EditActions = 'paste' | 'add' | 'edit' | 'remove';
export type WindowEventType = 'reload' | EditActions;
export type WindowEvent = {
  type: WindowEventType;
  args: unknown[];
};

export type PasteMode = 'normal' | 'fifo';
