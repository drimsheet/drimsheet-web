import accountDetailsHelpers from '@/account/pages/account-details/helper';
import { describe, expect, it } from 'vitest';

describe('accountDetailsHelpers', () => {
  it('ends the current month at today and handles leap-year month ends', () => {
    const now = new Date(2026, 9, 12);
    expect(accountDetailsHelpers.periodQuery('2026-10', now)).toEqual({
      from: '2026-10-01',
      to: '2026-10-12',
      bucketDays: 7,
    });
    expect(accountDetailsHelpers.periodQuery('2024-02', now).to).toBe(
      '2024-02-29'
    );
  });
  it('offers twelve months in descending order across year boundaries', () => {
    const periods = accountDetailsHelpers.periodOptions(
      new Date(2026, 0, 31),
      'en-GB'
    );

    expect(periods).toHaveLength(12);
    expect(periods[0]).toEqual({ value: '2026-01', label: 'January 2026' });
    expect(periods[1]).toEqual({ value: '2025-12', label: 'December 2025' });
  });
  it('formats calendar dates without interpreting them as UTC midnight', () => {
    expect(accountDetailsHelpers.formatDate('2026-10-12', 'en-GB')).toBe(
      '12 October 2026'
    );
  });
});
