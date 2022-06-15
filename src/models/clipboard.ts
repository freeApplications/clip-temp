import ClipTemp from './clip-temp';
import {
  ClipTemp as OriginClipTemp,
  Clipboard as OriginClipboard,
} from '~/@types';
import FilterableText from '~/models/filterable-text';

export default class Clipboard implements ClipTemp {
  readonly origin: OriginClipTemp;
  readonly text: FilterableText;
  constructor(clipboard: OriginClipboard) {
    this.origin = clipboard;
    this.text = new FilterableText(clipboard.text);
  }
  get time(): number {
    return this.origin.time;
  }
  get title(): FilterableText {
    return this.text;
  }
  equals(clipboard: OriginClipTemp | Clipboard): boolean {
    if (clipboard instanceof Clipboard) {
      clipboard = clipboard.origin;
    }
    return this.origin === clipboard;
  }
  compareTo(clipboard: OriginClipTemp | Clipboard): number {
    return clipboard.time - this.time;
  }
  match(filterWord: string): boolean {
    return this.text.match(filterWord);
  }
}
