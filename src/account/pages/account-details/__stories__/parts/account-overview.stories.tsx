import { AccountOverviewSkeleton } from '@/account/pages/account-details/parts/account-overview';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/AccountOverview',
  component: AccountOverviewSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof AccountOverviewSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Skeleton: Story = {};
