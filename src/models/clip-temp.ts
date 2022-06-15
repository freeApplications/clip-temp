import { ClipTemp as OriginClipTemp } from '~/@types';
import FilterableText from '~/models/filterable-text';

export default interface ClipTemp {
  readonly origin: OriginClipTemp;
  readonly time: number;
  readonly title: FilterableText;
  readonly text: FilterableText;
  equals: (clipTemp: OriginClipTemp | ClipTemp) => boolean;
  compareTo: (clipTemp: OriginClipTemp | ClipTemp) => number;
  match: (filterWord: string) => boolean;
}
