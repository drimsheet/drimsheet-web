import { CategoryTable } from '@/account/pages/categories/parts/category-table';
import type { IRevenueExpenseAccountDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const categoryAccount: IRevenueExpenseAccountDto = {
  accountId: 'services',
  accountName: 'Consulting services',
  code: '40001',
  type: 'revenue',
  subType: 'operating_revenue',
  status: 'active',
  amount: { amount: 840000000, currencyCode: 'NGN', isMinorUnit: true },
  sharePercentage: 70,
  transactionCount: 128,
};

const meta = {
  title: 'Ledger Accounts/Categories/Table',
  component: CategoryTable,
  tags: ['autodocs'],
  args: {
    accounts: {
      data: [
        categoryAccount,
        {
          ...categoryAccount,
          accountId: 'rent',
          accountName: 'Rent',
          type: 'expense',
          status: 'archived',
          amount: { ...categoryAccount.amount, amount: 0 },
          sharePercentage: null,
          transactionCount: 0,
        },
        {
          ...categoryAccount,
          accountId: 'suspense',
          accountName: 'Uncategorized receipts',
          type: 'liability',
          subType: 'suspense',
          sharePercentage: null,
        },
      ],
      meta: { page: 1, totalPages: 1, total: 3, limit: 10 },
    },
    loading: false,
    search: '',
    type: 'all',
    onSearchChange: () => {},
    onTypeChange: () => {},
    onPageChange: () => {},
    onViewAccount: () => {},
    onEditAccount: () => {},
    onArchiveAccount: () => {},
  },
} satisfies Meta<typeof CategoryTable>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { loading: true, accounts: undefined } };
export const Empty: Story = {
  args: {
    accounts: {
      data: [],
      meta: { page: 1, totalPages: 0, total: 0, limit: 10 },
    },
  },
};
