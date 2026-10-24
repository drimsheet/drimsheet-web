import helpers from '@/account/pages/account-dashboard/helper';
import { describe, expect, it } from 'vitest';

describe('account dashboard reporting', () => {
  it('anchors ranges on the same calendar day as the selected period', () => {
    expect(helpers.periodQuery('6M', new Date(2026, 9, 23))).toEqual({
      from: '2026-04-23',
      to: '2026-10-23',
    });
    expect(helpers.periodQuery('1Y', new Date(2024, 1, 29))).toEqual({
      from: '2023-03-01',
      to: '2024-02-29',
    });
    expect(helpers.periodQuery('1M', new Date(2026, 2, 31))).toEqual({
      from: '2026-02-28',
      to: '2026-03-31',
    });
  });
  it('uses readable chart bucket sizes for each supported period', () => {
    expect(helpers.bucketDays('1M')).toBe(5);
    expect(helpers.bucketDays('6M')).toBe(30);
    expect(helpers.bucketDays('1Y')).toBe(61);
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

  it('calculates balance growth from the first and last chart buckets', () => {
    const points = [
      {
        date: '2026-04-24',
        amount: {
          amount: 80000000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
      },
      {
        date: '2026-07-24',
        amount: {
          amount: 82000000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
      },
      {
        date: '2026-10-23',
        amount: {
          amount: 88400000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
      },
    ];

    expect(helpers.balanceChange(points)).toEqual({
      amount: {
        amount: 8400000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      percentageChange: 10.5,
      date: '2026-04-24',
    });
  });

  it('does not invent growth without two compatible chart buckets', () => {
    expect(helpers.balanceChange([])).toBeUndefined();
    expect(
      helpers.balanceChange([
        {
          date: '2026-10-23',
          amount: {
            amount: 88400000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
      ])
    ).toBeUndefined();

    expect(
      helpers.balanceChange([
        {
          date: '2026-04-24',
          amount: {
            amount: 80000000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
        {
          date: '2026-10-23',
          amount: {
            amount: 880000,
            currencyCode: 'USD',
            isMinorUnit: true,
          },
        },
      ])
    ).toBeUndefined();
  });

  it('marks percentage growth unavailable when the first chart bucket is zero', () => {
    expect(
      helpers.balanceChange([
        {
          date: '2026-04-24',
          amount: {
            amount: 0,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
        {
          date: '2026-10-23',
          amount: {
            amount: 100,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
      ])
    ).toMatchObject({ percentageChange: null });
  });

  it('resolves configured currency logos', () => {
    expect(helpers.currencyLogo('ngn')).toBe('https://flagcdn.com/w320/ng.png');
    expect(helpers.currencyLogo('unknown')).toBeUndefined();
  });
});
