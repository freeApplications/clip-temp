export type Clipboard = {
  time: number;
  text: string;
};

export type Template = {
  time: number;
  title: string;
  text: string;
};

export type WindowEventType = 'reload' | 'paste' | 'remove';
export type WindowEvent = {
  type: WindowEventType;
  args: unknown[];
};
