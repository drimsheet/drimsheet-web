import { AccountsTableError } from '@/account/components/accounts-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountsTable/Error',
  component: AccountsTableError,
  tags: ['autodocs'],
  args: {
    title: 'Couldn’t load accounts',
    description: 'Refresh the page to try again.',
  },
} satisfies Meta<typeof AccountsTableError>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
