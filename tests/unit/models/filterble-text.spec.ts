import FilterableText from '~/models/filterable-text';
import PartOfText from '~/models/part-of-text';

describe('FilterableText.ts', () => {
  test.each`
    case                             | text               | filterWord   | parts                                | isMatched
    ${'exact match'}                 | ${'abc'}           | ${'abc'}     | ${['abc']}                           | ${true}
    ${'forward match'}               | ${'abc***'}        | ${'ABC'}     | ${['abc', '***']}                    | ${true}
    ${'backward match'}              | ${'abc***'}        | ${'***'}     | ${['abc', '***']}                    | ${false}
    ${'partial match'}               | ${'***aBc***'}     | ${'abc'}     | ${['***', 'aBc', '***']}             | ${false}
    ${'partial match into multiple'} | ${'abc***-***xyz'} | ${'abc-xyz'} | ${['abc', '***', '-', '***', 'xyz']} | ${true}
    ${'partial match per character'} | ${'{a:[b.c(d)]}'}  | ${'{:bcd]'}  | ${'{a:[b.c(d)]}'.split('')}          | ${true}
  `(
    'text matches filter word | $case',
    ({ text, filterWord, parts, isMatched }) => {
      const expectedParts = parts.map((part: string, index: number) => {
        return new PartOfText(part, [isMatched, !isMatched][index % 2]);
      });
      const filterableText = new FilterableText(text);
      expect(filterableText.match(filterWord)).toBe(true);
      expect(filterableText.parts).toStrictEqual(expectedParts);
    }
  );
});
