export type Clipboard = {
  time: number;
  text: string;
  html: string;
};

export type WindowEventType = 'paste' | 'remove';
export type WindowEvent = {
  type: WindowEventType;
  args: unknown[];
};
