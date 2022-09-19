declare module 'clipboard-event' {
  import { EventEmitter } from 'events';
  import { ChildProcess } from 'child_process';
  declare class ClipboardEventListener extends EventEmitter {
    constructor();
    startListening(): void;
    stopListening(): boolean;
    child: ChildProcess;
  }
  declare const clipboardListener: ClipboardEventListener;
  export = clipboardListener;
}
