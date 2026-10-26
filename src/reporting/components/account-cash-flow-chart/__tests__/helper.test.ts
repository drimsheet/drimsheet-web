import accountCashFlowChartHelpers from '@/reporting/components/account-cash-flow-chart/helper';
import type {
  IAccountCashFlowDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, it } from 'vitest';

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

it('normalizes mixed unit buckets while retaining their inclusive date range', () => {
  expect(accountCashFlowChartHelpers.chartData(cashFlow, 'en-GB')).toEqual([
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
it('retains the selected date range for zero activity without adding nonzero values', () => {
  const data = accountCashFlowChartHelpers.chartData(
    {
      ...cashFlow,
      buckets: [],
      totalMoneyIn: { ...cashFlow.totalMoneyIn, amount: 0 },
      totalMoneyOut: { ...cashFlow.totalMoneyOut, amount: 0 },
    },
    'en-GB'
  );

  expect(data).toEqual([
    {
      label: '1 Oct',
      range: '1 October 2026 – 7 October 2026',
      moneyIn: 0,
      moneyOut: 0,
    },
    {
      label: '8 Oct',
      range: '8 October 2026 – 12 October 2026',
      moneyIn: 0,
      moneyOut: 0,
    },
  ]);
});
it('does not fabricate zero buckets when nonzero totals have no bucket data', () => {
  expect(
    accountCashFlowChartHelpers.chartData({ ...cashFlow, buckets: [] }, 'en-GB')
  ).toEqual([]);
});

it('retains signed buckets when period totals cancel out', () => {
  const data = accountCashFlowChartHelpers.chartData(
    {
      ...cashFlow,
      totalMoneyIn: { ...cashFlow.totalMoneyIn, amount: 0 },
      totalMoneyOut: { ...cashFlow.totalMoneyOut, amount: 0 },
      buckets: cashFlow.buckets.map((bucket, index) => ({
        ...bucket,
        moneyIn: {
          amount: index === 0 ? 100 : -100,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        moneyOut: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      })),
    },
    'en-GB'
  );

  expect(data.map(({ moneyIn }) => moneyIn)).toEqual([100, -100]);
});
