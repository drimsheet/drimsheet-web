import categoriesHelpers from '@/account/pages/categories/helper';
import type { IRevenueExpenseAndSuspenseAccountBalanceDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

describe('categoriesHelpers', () => {
  it('identifies table rows by account ID while preserving zero balances and null shares', () => {
    const account: IRevenueExpenseAndSuspenseAccountBalanceDto = {
      accountId: 'archived-services',
      accountName: 'Services',
      code: '40001',
      type: 'revenue',
      subType: 'operating_revenue',
      status: 'archived',
      amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      sharePercentage: null,
      transactionCount: 0,
    };

    const rows = categoriesHelpers.tableRows([
      account,
      { ...account, accountId: 'active-services', status: 'active' },
    ]);

    expect(rows.map(({ id }) => id)).toEqual([
      'archived-services',
      'active-services',
    ]);
    expect(rows[0]).toEqual({ ...account, id: 'archived-services' });
    expect(account).not.toHaveProperty('id');
    expect(categoriesHelpers.tableRows([])).toEqual([]);
  });

  it('offers twelve calendar months across year boundaries', () => {
    const options = categoriesHelpers.periodOptions(
      new Date(2026, 0, 14),
      'en-GB'
    );

    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ value: '2026-01', label: 'January 2026' });
    expect(options[11].value).toBe('2025-02');
  });

  it('caps the current month at today and includes all of a past leap month', () => {
    expect(
      categoriesHelpers.periodQuery('2026-10', new Date(2026, 9, 14))
    ).toEqual({ from: '2026-10-01', to: '2026-10-14' });
    expect(
      categoriesHelpers.periodQuery('2024-02', new Date(2024, 2, 5))
    ).toEqual({ from: '2024-02-01', to: '2024-02-29' });
  });

  it('formats inclusive calendar ranges without shifting date-only values', () => {
    expect(
      categoriesHelpers.formatPeriod(
        { from: '2026-10-01', to: '2026-10-14' },
        'en-GB'
      )
    ).toBe('1 Oct 2026 – 14 Oct 2026');
  });

  it('normalizes minor units using the currency precision', () => {
    expect(
      categoriesHelpers.toMajorUnits({
        amount: 12345,
        currencyCode: 'NGN',
        isMinorUnit: true,
      })
    ).toBe(123.45);
    expect(
      categoriesHelpers.toMajorUnits({
        amount: 12345,
        currencyCode: 'NGN',
        isMinorUnit: false,
      })
    ).toBe(12345);
    expect(
      categoriesHelpers.toMajorUnits({
        amount: 12345,
        currencyCode: 'JPY',
        isMinorUnit: true,
      })
    ).toBe(12345);
  });

  it('uses a common zero baseline for mixed signed amounts and ignores share as a bar length', () => {
    const rows = categoriesHelpers.chartRows([
      {
        accountId: 'positive',
        accountName: 'Revenue',
        amount: { amount: 80000, currencyCode: 'NGN', isMinorUnit: true },
        sharePercentage: 200,
      },
      {
        accountId: 'negative',
        accountName: 'Refunds',
        amount: { amount: -400, currencyCode: 'NGN', isMinorUnit: false },
        sharePercentage: -100,
      },
    ]);

    expect(rows[0].zero).toBeCloseTo(100 / 3);
    expect(rows[0].left).toBeCloseTo(100 / 3);
    expect(rows[0].width).toBeCloseTo(200 / 3);
    expect(rows[1].left).toBe(0);
    expect(rows[1].width).toBeCloseTo(100 / 3);
    expect(rows[1].negative).toBe(true);
  });

  it('handles empty and zero-amount charts without invalid widths', () => {
    expect(categoriesHelpers.chartRows([])).toEqual([]);

    const [row] = categoriesHelpers.chartRows([
      {
        accountId: 'zero',
        accountName: 'Zero',
        amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
        sharePercentage: null,
      },
    ]);

    expect(row.width).toBe(0);
    expect(row.left).toBe(0);
  });

  it('distinguishes unavailable percentages from zero', () => {
    expect(categoriesHelpers.formatPercentage(null, 'en')).toBe('—');
    expect(categoriesHelpers.formatPercentage(0, 'en')).toBe('0%');
    expect(categoriesHelpers.formatPercentage(12.45, 'en', true)).toBe(
      '+12.5%'
    );
    expect(categoriesHelpers.formatPercentage(-10, 'en', true)).toBe('-10%');
  });
});
