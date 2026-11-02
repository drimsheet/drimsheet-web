import categoryDetailsHelpers from '@/account/pages/category-details/helper';
import type { IAccountActivityDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const money = { amount: 0, currencyCode: 'NGN', isMinorUnit: true };

const report: IAccountActivityDto = {
  accountId: 'category',
  currencyCode: 'NGN',
  period: { from: '2026-01-01', to: '2026-03-15' },
  buckets: [
    {
      from: '2026-01-01',
      to: '2026-01-01',
      delta: { ...money, amount: 10000 },
      totalDebits: { ...money, amount: 10000 },
      totalCredits: money,
    },
    {
      from: '2026-01-20',
      to: '2026-01-20',
      delta: { ...money, amount: -2500 },
      totalDebits: money,
      totalCredits: { ...money, amount: 2500 },
    },
    {
      from: '2026-03-15',
      to: '2026-03-15',
      delta: { ...money, amount: 50, isMinorUnit: false },
      totalDebits: { ...money, amount: 50 },
      totalCredits: money,
    },
  ],
};

describe('categoryDetailsHelpers', () => {
  it('aggregates daily signed amounts into calendar months, normalizing minor units and filling empty months', () => {
    const result = categoryDetailsHelpers.fromActivity(report);
    expect(result.months).toEqual([
      { month: '2026-01', amount: 75 },
      { month: '2026-02', amount: 0 },
      { month: '2026-03', amount: 50 },
    ]);
    expect(result.balance).toEqual({
      amount: 125,
      currencyCode: 'NGN',
      isMinorUnit: false,
    });
    expect(result.hasActivity).toBe(true);
  });
  it('distinguishes offsetting activity from an empty report', () => {
    expect(
      categoryDetailsHelpers.fromActivity({
        ...report,
        buckets: [
          {
            ...report.buckets[0],
            delta: money,
            totalCredits: { ...money, amount: 10000 },
          },
        ],
      })
    ).toMatchObject({ balance: { amount: 0 }, hasActivity: true });
    expect(
      categoryDetailsHelpers.fromActivity({ ...report, buckets: [] })
    ).toMatchObject({ balance: { amount: 0 }, hasActivity: false });
  });
  it('preserves a negative period total and rejects mixed currencies', () => {
    expect(
      categoryDetailsHelpers.fromActivity({
        ...report,
        buckets: [report.buckets[1]],
      }).balance.amount
    ).toBe(-25);
    expect(() =>
      categoryDetailsHelpers.fromActivity({
        ...report,
        buckets: [
          { ...report.buckets[0], delta: { ...money, currencyCode: 'USD' } },
        ],
      })
    ).toThrow();
  });
  it('limits the journal query to the first ten entries with dates and optional counterparty', () => {
    expect(
      categoryDetailsHelpers.recentQuery(
        'category',
        '2026-01-01',
        '2026-02-01',
        'vendor'
      )
    ).toEqual({
      accountId: 'category',
      effectiveDateFrom: '2026-01-01',
      effectiveDateTo: '2026-02-01',
      page: 1,
      limit: 10,
      orderBy: 'effectiveDate',
      sortDirection: 'desc',
      status: 'posted',
      counterpartyId: 'vendor',
    });
  });
});
