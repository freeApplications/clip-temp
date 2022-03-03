declare module 'clipboard-event' {
  import { EventEmitter } from 'events';
  declare class ClipboardEventListener extends EventEmitter {
    constructor();
    startListening(): void;
    stopListening(): boolean;
  }
  declare const clipboardListener: ClipboardEventListener;
  export = clipboardListener;
}
