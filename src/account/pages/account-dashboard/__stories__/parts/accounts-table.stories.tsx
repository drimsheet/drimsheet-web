import type { IAssetLiabilityAccountParticipationDto } from '@/shared/lib/api/Api';

const money = {
  amount: 12480000,
  currencyCode: 'NGN',
  isMinorUnit: false,
};

const account: IAssetLiabilityAccountParticipationDto = {
  accountId: 'operating',
  accountName: 'Operating',
  code: '10001',
  type: 'asset',
  subType: 'cash_and_cash_equivalent',
  status: 'active',
  amount: { ...money, amount: 5400000 },
  sharePercentage: 34.44,
};

import { AccountsTable } from '@/account/pages/account-dashboard/parts/accounts-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountsTable',
  component: AccountsTable,
  tags: ['autodocs'],
  args: {
    accounts: {
      data: [account],
      meta: { page: 1, totalPages: 1, total: 1, limit: 10 },
    },
    loading: false,
    error: false,
    search: '',
    type: 'all',
    onSearchChange: () => {},
    onTypeChange: () => {},
    onPageChange: () => {},
    onRetry: () => {},
    onAddAccount: () => {},
    onViewAccount: () => {},
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
export const NoLiabilities: Story = {
  args: {
    type: 'liability',
    accounts: {
      data: [],
      meta: { page: 1, totalPages: 1, total: 0, limit: 10 },
    },
  },
};
