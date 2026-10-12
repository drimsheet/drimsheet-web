import { RecentTransactionsSkeleton } from '@/account/pages/account-details/parts/recent-transactions-skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/RecentTransactionsSkeleton',
  component: RecentTransactionsSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof RecentTransactionsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
