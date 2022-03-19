import { Clipboard as OriginClipboard } from '~/@types';
import FilterableText from '~/models/filterable-text';

export default class Clipboard {
  readonly origin: OriginClipboard;
  readonly text: FilterableText;
  constructor(clipboard: OriginClipboard) {
    this.origin = clipboard;
    this.text = new FilterableText(clipboard.text);
  }
  get time(): number {
    return this.origin.time;
  }
  equals(clipboard: OriginClipboard | Clipboard): boolean {
    if (clipboard instanceof Clipboard) {
      clipboard = clipboard.origin;
    }
    return this.origin === clipboard;
  }
  compareTo(clipboard: OriginClipboard | Clipboard): number {
    return clipboard.time - this.time;
  }
  match(filterWord: string): boolean {
    return this.text.match(filterWord);
  }
}
