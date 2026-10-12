import { SubAccountsSkeleton } from '@/account/pages/account-details/parts/sub-accounts-skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/SubAccountsSkeleton',
  component: SubAccountsSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof SubAccountsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
