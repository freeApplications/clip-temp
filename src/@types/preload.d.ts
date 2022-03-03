import { Clipboard } from './';

declare global {
  interface Window {
    api: {
      orderClipboard: () => void;
      deliverClipboard: (action: (histories: Clipboard[]) => void) => void;
    };
  }
}
