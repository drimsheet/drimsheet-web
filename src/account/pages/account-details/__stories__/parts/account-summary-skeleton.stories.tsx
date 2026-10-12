import { AccountSummarySkeleton } from '@/account/pages/account-details/parts/account-summary-skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/AccountSummarySkeleton',
  component: AccountSummarySkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof AccountSummarySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
