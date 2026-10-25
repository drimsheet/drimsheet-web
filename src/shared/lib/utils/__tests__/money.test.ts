import { toMajorUnits } from '@/shared/lib/utils/money';
import { describe, expect, it } from 'vitest';

describe('toMajorUnits', () => {
  it.each([
    [123400, 'USD', true, 1234],
    [123456, 'ngn', true, 1234.56],
    [-12345, 'USD', true, -123.45],
    [-1234, 'JPY', true, -1234],
    [1234, 'USD', false, 1234],
    [1234, 'XYZ', true, 1234],
    [1234, 'XYZ', false, 1234],
    [0, 'USD', true, 0],
  ])(
    'converts %s %s with isMinorUnit=%s to %s',
    (amount, currencyCode, isMinorUnit, expected) => {
      const money = Object.freeze({ amount, currencyCode, isMinorUnit });
      expect(toMajorUnits(money)).toBe(expected);
    }
  );
});
