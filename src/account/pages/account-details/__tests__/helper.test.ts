import accountDetailsHelpers from '@/account/pages/account-details/helper';
import { describe, expect, it } from 'vitest';

describe('accountDetailsHelpers', () => {
  it('formats calendar dates without interpreting them as UTC midnight', () => {
    expect(accountDetailsHelpers.formatDate('2026-10-12', 'en-GB')).toBe(
      '12 October 2026'
    );
  });
});
