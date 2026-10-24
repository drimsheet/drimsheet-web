import { AccountRowActions } from '@/account/pages/account-dashboard/parts/account-row-actions';
import { AccountsTable } from '@/account/pages/account-dashboard/parts/accounts-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const accounts = {
  data: [
    {
      id: 'operating',
      name: 'Operating account',
      behavior: 'bank' as const,
      balance: {
        amount: 62500000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      status: 'active' as const,
    },
    {
      id: 'office-cash',
      name: 'Office cash',
      behavior: 'petty_cash' as const,
      balance: {
        amount: 8750000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      status: 'active' as const,
    },
  ],
  meta: { page: 1, totalPages: 1, total: 2, limit: 10 },
};

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountsTable',
  component: AccountsTable,
  tags: ['autodocs'],
  args: {
    accounts,
    loading: false,
    error: false,
    search: '',
    type: 'all',
    onSearchChange: () => {},
    onTypeChange: () => {},
    onPageChange: () => {},
    onAddAccount: () => {},
    onViewAccount: () => {},
    renderRowActions: (account) => (
      <AccountRowActions
        account={account}
        canDelete
        onOpenChange={() => {}}
        onEdit={() => {}}
        onArchive={async () => {}}
        onDelete={() => {}}
      />
    ),
  },
} satisfies Meta<typeof AccountsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true, accounts: undefined } };
export const Error: Story = { args: { error: true, accounts: undefined } };
export const NoResults: Story = {
  args: {
    search: 'Mortgage',
    accounts: {
      data: [],
      meta: { page: 1, totalPages: 1, total: 0, limit: 10 },
    },
  },
};
export const NoBankAccounts: Story = {
  args: {
    type: 'bank',
    accounts: {
      data: [],
      meta: { page: 1, totalPages: 1, total: 0, limit: 10 },
    },
  },
};
