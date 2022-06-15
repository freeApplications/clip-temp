import { Clipboard, Template, WindowEventType } from './';

declare global {
  interface Window {
    api: {
      // clipboard
      orderClipboard: () => void;
      deliverClipboard: (action: (histories: Clipboard[]) => void) => void;
      pasteClipboard: (index: number) => void;
      removeClipboard: (index: number) => void;
      // template
      saveTemplate: (title: string, text: string) => void;
      orderTemplate: () => void;
      deliverTemplate: (action: (templates: Template[]) => void) => void;
      // window
      showEditMenu: () => void;
      pressKey: (key: string, shiftKey: boolean) => void;
      closeWindow: () => void;
      storeWindowEvent: (
        action: (type: WindowEventType, ...args: unknown[]) => void
      ) => void;
    };
  }
}
