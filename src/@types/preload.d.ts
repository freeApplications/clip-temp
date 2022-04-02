import { Clipboard, WindowEventType } from './';

declare global {
  interface Window {
    api: {
      orderClipboard: () => void;
      deliverClipboard: (action: (histories: Clipboard[]) => void) => void;
      pasteClipboard: (index: number, asPlainText = false) => void;
      removeClipboard: (index: number) => void;
      showEditMenu: () => void;
      pressKey: (key: string, shiftKey: boolean) => void;
      closeWindow: () => void;
      storeWindowEvent: (
        action: (type: WindowEventType, ...args: unknown[]) => void
      ) => void;
    };
  }
}
