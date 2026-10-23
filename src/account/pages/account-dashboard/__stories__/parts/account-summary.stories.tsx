import { AccountsSummarySkeleton } from '@/account/pages/account-dashboard/parts/account-summary';
import type { IAssetLiabilitySummaryDto } from '@/shared/lib/api/Api';

const money = {
  amount: 12480000,
  currencyCode: 'NGN',
  isMinorUnit: false,
};

const summary: IAssetLiabilitySummaryDto = {
  currencyCode: 'NGN',
  period: { from: '2026-04-24', to: '2026-10-23' },
  comparisonPeriod: { from: '2025-10-24', to: '2026-04-23' },
  assets: {
    total: { ...money, amount: 15680000 },
    previousTotal: { ...money, amount: 13600000 },
    change: { ...money, amount: 2080000 },
    percentageChange: 15.29,
  },
  liabilities: {
    total: { ...money, amount: 3200000 },
    previousTotal: { ...money, amount: 3200000 },
    change: { ...money, amount: 0 },
    percentageChange: 0,
  },
  netAssets: {
    total: money,
    previousTotal: { ...money, amount: 10400000 },
    change: { ...money, amount: 2080000 },
    percentageChange: 20,
  },
};

import { AccountsSummary } from '@/account/pages/account-dashboard/parts/account-summary';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountsSummary',
  component: AccountsSummary,
  tags: ['autodocs'],
  args: { summary },
} satisfies Meta<typeof AccountsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ZeroBalance: Story = {
  args: {
    summary: {
      ...summary,
      netAssets: {
        ...summary.netAssets,
        total: { ...money, amount: 0 },
        previousTotal: { ...money, amount: 0 },
        change: { ...money, amount: 0 },
        percentageChange: null,
      },
    },
  },
};

export const Skeleton: Story = { render: () => <AccountsSummarySkeleton /> };
