import {
  AccountCashFlowChartRange,
  AccountCashFlowChartRangeSkeleton,
} from '@/account/pages/account-details/parts/account-cash-flow-chart-range';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/AccountCashFlowChartRange',
  component: AccountCashFlowChartRange,
  tags: ['autodocs'],
  args: {
    period: { from: '2026-10-01', to: '2026-10-24' },
    currencyCode: 'USD',
  },
} satisfies Meta<typeof AccountCashFlowChartRange>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Skeleton: Story = {
  render: () => <AccountCashFlowChartRangeSkeleton />,
};
