import moneyHelpers from '@/shared/components/money/helper';
import { describe, expect, it } from 'vitest';

describe('moneyHelpers.getLocale', () => {
  it.each([
    ['US', 'en-US'],
    ['DE', 'de-DE'],
    ['NG', 'en-NG'],
    ['gb', 'en-GB'],
    [undefined, 'en-US'],
    ['', 'en-US'],
    ['ZZ', 'en-US'],
    ['EUR', 'en-US'],
  ])('resolves jurisdiction %s to %s', (code, expected) => {
    expect(moneyHelpers.getLocale(code)).toBe(expected);
  });
});
