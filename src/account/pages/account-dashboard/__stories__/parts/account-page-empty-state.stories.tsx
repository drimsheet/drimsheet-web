import { AccountPageEmptyState } from '@/account/pages/account-dashboard/parts/account-page-empty-state';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountPageEmptyState',
  component: AccountPageEmptyState,
  tags: ['autodocs'],
  args: { onAddAccount: () => {} },
} satisfies Meta<typeof AccountPageEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
