export default class PartOfText extends String {
  readonly isMatched: boolean;
  constructor(value: string, isMatched = false) {
    super(value);
    this.isMatched = isMatched;
  }
}
