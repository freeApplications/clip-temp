import { Clipboard, Template, WindowEventType, EditActions } from './';

declare global {
  interface Window {
    api: {
      // clipboard
      orderClipboard: () => void;
      deliverClipboard: (action: (histories: Clipboard[]) => void) => void;
      pasteClipboard: (index: number) => void;
      removeClipboard: (index: number) => void;
      deliverFirstInFirstOut: (
        action: (firstInFirstOUt: string[]) => void
      ) => void;
      toggleFirstInFirstOutRepeat: () => void;
      // template
      saveTemplate: (
        index: number | string,
        title: string,
        text: string
      ) => void;
      orderTemplate: () => void;
      deliverTemplate: (action: (templates: Template[]) => void) => void;
      getTemplate: (index: number) => Promise;
      pasteTemplate: (index: number) => void;
      removeTemplate: (index: number) => void;
      // window
      showEditMenu: (editable: EditActions[]) => void;
      changeEditable: (editable: EditActions[]) => void;
      pressKey: (key: string, shiftKey: boolean) => void;
      closeMainWindow: () => void;
      storeWindowEvent: (
        action: (type: WindowEventType, ...args: unknown[]) => void
      ) => void;
      resizeSubWindow: (height: number) => void;
      closeSubWindow: () => void;
      showCloseMenu: () => void;
    };
  }
}
