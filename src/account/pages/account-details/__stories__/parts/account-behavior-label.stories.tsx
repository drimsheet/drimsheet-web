import { AccountBehaviorLabel } from '@/account/pages/account-details/parts/account-behavior-label';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/LedgerAccountSummary/AccountBehaviorLabel',
  component: AccountBehaviorLabel,
  tags: ['autodocs'],
  args: { behavior: 'bank' },
} satisfies Meta<typeof AccountBehaviorLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bank: Story = {};

export const PettyCash: Story = {
  args: { behavior: 'petty_cash' },
};

export const OtherBehavior: Story = {
  args: { behavior: 'default_cash' },
};
