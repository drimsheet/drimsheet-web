import type {
  IAccountCashFlowDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';

const labels = {
  moneyInLabel: 'Money in',
  moneyOutLabel: 'Money out',
  totalInLabel: 'Total in',
  totalOutLabel: 'Total out',
  dateLabel: 'Date',
  chartLabel: 'Money in and money out by date',
};

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

import {
  AccountCashFlowChart,
  AccountCashFlowChartWithState,
} from '@/reporting/components/account-cash-flow-chart';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/AccountCashFlowChart',
  component: AccountCashFlowChart,
  tags: ['autodocs'],
  args: { cashFlow, labels },
} satisfies Meta<typeof AccountCashFlowChart>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = {
  args: {
    cashFlow: {
      ...cashFlow,
      buckets: [],
      totalMoneyIn: { ...cashFlow.totalMoneyIn, amount: 0 },
      totalMoneyOut: { ...cashFlow.totalMoneyOut, amount: 0 },
    },
  },
};
export const MoreMoneyOut: Story = {
  args: {
    cashFlow: {
      ...cashFlow,
      totalMoneyIn: cashFlow.totalMoneyOut,
      totalMoneyOut: cashFlow.totalMoneyIn,
      buckets: cashFlow.buckets.map((bucket) => ({
        ...bucket,
        moneyIn: bucket.moneyOut,
        moneyOut: bucket.moneyIn,
      })),
    },
  },
};

export const MissingData: Story = {
  render: (args) => (
    <AccountCashFlowChartWithState
      labels={{
        ...args.labels,
        loadingLabel: 'Loading cash flow',
        errorTitle: 'Cash flow',
        errorDescription: 'Unable to load this section.',
      }}
    />
  ),
};
