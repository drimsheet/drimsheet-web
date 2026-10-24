import {
  TransactionsChartRange,
  TransactionsChartRangeSkeleton,
} from '@/account/pages/account-details/parts/transactions-chart-range';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/TransactionsChartRange',
  component: TransactionsChartRange,
  tags: ['autodocs'],
  args: {
    period: { from: '2026-10-01', to: '2026-10-24' },
    currencyCode: 'USD',
  },
} satisfies Meta<typeof TransactionsChartRange>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Skeleton: Story = {
  render: () => <TransactionsChartRangeSkeleton />,
};
