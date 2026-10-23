import { BalanceTrendSkeleton } from '@/account/pages/account-dashboard/parts/balance-trend';

const money = {
  amount: 12480000,
  currencyCode: 'NGN',
  isMinorUnit: false,
};

import { BalanceTrend } from '@/account/pages/account-dashboard/parts/balance-trend';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/BalanceTrend',
  component: BalanceTrend,
  tags: ['autodocs'],
  args: {
    points: [
      { date: '2026-04-23', amount: { ...money, amount: 10400000 } },
      { date: '2026-07-23', amount: { ...money, amount: 11420000 } },
      { date: '2026-10-23', amount: money },
    ],
  },
} satisfies Meta<typeof BalanceTrend>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoHistory: Story = { args: { points: [] } };
export const ZeroActivity: Story = {
  args: {
    points: [
      { date: '2026-04-23', amount: { ...money, amount: 0 } },
      { date: '2026-10-23', amount: { ...money, amount: 0 } },
    ],
  },
};
export const NegativeBalance: Story = {
  args: {
    points: [
      { date: '2026-04-23', amount: { ...money, amount: -1000000 } },
      { date: '2026-10-23', amount: { ...money, amount: -3000000 } },
    ],
  },
};

export const Skeleton: Story = { render: () => <BalanceTrendSkeleton /> };
