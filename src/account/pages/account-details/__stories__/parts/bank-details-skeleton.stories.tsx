import { BankDetailsSkeleton } from '@/account/pages/account-details/parts/bank-details-skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/BankDetailsSkeleton',
  component: BankDetailsSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof BankDetailsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
