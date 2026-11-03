import helpers from '@/account/pages/account-dashboard/helper';
import { describe, expect, it } from 'vitest';

describe('account dashboard reporting', () => {
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
});
