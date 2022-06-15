import ClipTemp from './clip-temp';
import {
  ClipTemp as OriginClipTemp,
  Template as OriginTemplate,
} from '~/@types';
import FilterableText from '~/models/filterable-text';

export default class Template implements ClipTemp {
  readonly origin: OriginClipTemp;
  readonly title: FilterableText;
  readonly text: FilterableText;
  constructor(template: OriginTemplate) {
    this.origin = template;
    this.title = new FilterableText(template.title);
    this.text = new FilterableText(template.text);
  }
  get time(): number {
    return this.origin.time;
  }
  equals(template: OriginClipTemp | Template): boolean {
    if (template instanceof Template) {
      template = template.origin;
    }
    return this.origin === template;
  }
  compareTo(template: OriginClipTemp | Template): number {
    return template.time - this.time;
  }
  match(filterWord: string): boolean {
    return this.title.match(filterWord) || this.text.match(filterWord);
  }
}
