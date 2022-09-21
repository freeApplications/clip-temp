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
  test.each`
    case                                                 | text            | expected
    ${'exact match'}                                     | ${'test'}       | ${0}
    ${'forward match'}                                   | ${'test***'}    | ${0}
    ${'backward match'}                                  | ${'***test'}    | ${-3}
    ${'partial match'}                                   | ${'***test***'} | ${-3}
    ${'partial match into multiple (index: 1~3, 6)'}     | ${'*tes**t'}    | ${-27}
    ${'partial match into multiple (index: 1~2, 6~7)'}   | ${'*te***st'}   | ${-47}
    ${'partial match into multiple (index: 1, 6~8)'}     | ${'*t****est'}  | ${-67}
    ${'partial match into multiple (index: 0, 2, 4, 6)'} | ${'t*e*s*t'}    | ${-212}
  `('judgment of priority | $case', ({ text, expected }) => {
    const filterableText = new FilterableText(text);
    filterableText.match('test');
    expect(filterableText.priority).toBe(expected);
  });
});
