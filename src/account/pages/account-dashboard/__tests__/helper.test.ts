import helpers from '@/account/pages/account-dashboard/helper';
import { describe, expect, it } from 'vitest';

describe('account dashboard reporting', () => {
  it('uses inclusive ranges whose comparison ends at the displayed starting date', () => {
    expect(helpers.periodQuery('6M', new Date(2026, 9, 23))).toEqual({
      from: '2026-04-24',
      to: '2026-10-23',
    });
    expect(helpers.periodQuery('1Y', new Date(2024, 1, 29))).toEqual({
      from: '2023-03-01',
      to: '2024-02-29',
    });
    expect(helpers.periodQuery('1M', new Date(2026, 2, 31))).toEqual({
      from: '2026-03-01',
      to: '2026-03-31',
    });
  });
  it('requests five distinct chronological snapshots inside the range', () => {
    const dates = helpers.historyDates({
      from: '2026-04-24',
      to: '2026-10-23',
    });

    expect(dates).toHaveLength(5);
    expect(new Set(dates).size).toBe(5);
    expect(dates).toEqual([...dates].sort());
    expect(
      dates.every((date) => date > '2026-04-23' && date < '2026-10-23')
    ).toBe(true);
  });
  it('keeps major and minor unit money on the same chart scale, including negatives', () => {
    expect(
      helpers.toMajorUnits({
        amount: 123456,
        currencyCode: 'NGN',
        isMinorUnit: true,
      })
    ).toBe(1234.56);
    expect(
      helpers.toMajorUnits({
        amount: -1234,
        currencyCode: 'JPY',
        isMinorUnit: true,
      })
    ).toBe(-1234);
    expect(
      helpers.toMajorUnits({
        amount: 1234,
        currencyCode: 'NGN',
        isMinorUnit: false,
      })
    ).toBe(1234);
  });
  it('never clamps missing, negative or over-total shares into progress bars', () => {
    expect(helpers.shareWidth(null)).toBeNull();
    expect(helpers.shareWidth(-20)).toBeNull();
    expect(helpers.shareWidth(120)).toBeNull();
    expect(helpers.shareWidth(0)).toBe(0);
    expect(helpers.shareWidth(34.44)).toBe(34.44);
    expect(helpers.formatPercentage(null, 'en')).toBe('—');
    expect(helpers.formatPercentage(-20, 'en')).toBe('-20%');
  });
});
