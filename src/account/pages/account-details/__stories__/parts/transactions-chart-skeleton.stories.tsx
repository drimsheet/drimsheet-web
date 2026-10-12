import { TransactionsChartSkeleton } from '@/account/pages/account-details/parts/transactions-chart-skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/TransactionsChartSkeleton',
  component: TransactionsChartSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionsChartSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
