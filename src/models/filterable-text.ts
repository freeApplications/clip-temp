import PartOfText from '~/models/part-of-text';

export default class FilterableText {
  readonly value: string;
  parts: PartOfText[];
  constructor(value: string) {
    this.value = value;
    this.parts = [new PartOfText(value)];
  }
  match(filterWord: string): boolean {
    if (filterWord === '') return true;
    this.parts = [];
    const match = (start: number, filterWord: string): boolean => {
      const value = this.value.slice(start);
      let index = -1;
      let word = filterWord;
      while (word.length) {
        const pattern = word.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
        index = value.search(new RegExp(pattern, 'i'));
        if (index > -1) break;
        word = word.slice(0, word.length - 1);
      }
      if (index === -1) {
        this.parts = [];
        return false;
      }
      const end = index + word.length;
      if (index > 0) {
        this.parts.push(new PartOfText(value.slice(0, index)));
      }
      this.parts.push(new PartOfText(value.slice(index, end), true));
      if (word !== filterWord) {
        return match(start + end, filterWord.slice(word.length));
      }
      if (end < value.length) {
        this.parts.push(new PartOfText(value.slice(end, value.length)));
      }
      return true;
    };
    return match(0, filterWord);
  }
}
