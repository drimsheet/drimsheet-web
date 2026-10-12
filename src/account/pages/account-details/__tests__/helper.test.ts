import accountDetailsHelpers from '@/account/pages/account-details/helper';
import type {
  IAccountCashFlowDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const account: ILedgerAccountDto = {
  id: 'account-1' as TEntityId,
  code: '100001',
  materializedPath: '100001',
  accountingEntityId: 'entity-1' as TEntityId,
  type: 'asset',
  normalBalance: 'debit',
  subType: 'cash_and_cash_equivalent',
  behavior: 'bank',
  isControlAccount: false,
  name: 'Main business account',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: 'user-1' as TEntityId,
  createdAt: '2026-01-14T12:00:00Z',
  updatedAt: '2026-01-14T12:00:00Z',
  balance: { amount: 245000000, currencyCode: 'NGN', isMinorUnit: true },
  functionalBalance: {
    amount: 2450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const cashFlow: IAccountCashFlowDto = {
  accountId: account.id,
  currencyCode: 'NGN',
  period: { from: '2026-10-01', to: '2026-10-12' },
  totalMoneyIn: { amount: 120000000, currencyCode: 'NGN', isMinorUnit: true },
  totalMoneyOut: { amount: 780000, currencyCode: 'NGN', isMinorUnit: false },
  buckets: [
    {
      from: '2026-10-01',
      to: '2026-10-07',
      moneyIn: { amount: 60000000, currencyCode: 'NGN', isMinorUnit: true },
      moneyOut: { amount: 280000, currencyCode: 'NGN', isMinorUnit: false },
    },
    {
      from: '2026-10-08',
      to: '2026-10-12',
      moneyIn: { amount: 600000, currencyCode: 'NGN', isMinorUnit: false },
      moneyOut: { amount: 50000000, currencyCode: 'NGN', isMinorUnit: true },
    },
  ],
};

describe('accountDetailsHelpers', () => {
  it.each([
    ['NGN', 12345, 123.45],
    ['JPY', 12345, 12345],
    ['USD', -12345, -123.45],
  ])('converts %s minor units', (currencyCode, amount, expected) => {
    expect(
      accountDetailsHelpers.toMajorUnits({
        currencyCode,
        amount,
        isMinorUnit: true,
      })
    ).toBe(expected);
    expect(
      accountDetailsHelpers.toMajorUnits({
        currencyCode,
        amount,
        isMinorUnit: false,
      })
    ).toBe(amount);
  });
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
  it('normalizes mixed unit buckets while retaining their inclusive date range', () => {
    expect(accountDetailsHelpers.chartData(cashFlow, 'en-GB')).toEqual([
      {
        label: '1 Oct',
        range: '1 October 2026 – 7 October 2026',
        moneyIn: 600000,
        moneyOut: 280000,
      },
      {
        label: '8 Oct',
        range: '8 October 2026 – 12 October 2026',
        moneyIn: 600000,
        moneyOut: 500000,
      },
    ]);
  });
});
