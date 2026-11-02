import { CategoryTable } from '@/account/pages/categories/parts/category-table';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const categoryAccount: ILedgerAccountDto = {
  id: 'services',
  materializedPath: '40001',
  accountingEntityId: 'entity',
  normalBalance: 'credit',
  behavior: 'services',
  isControlAccount: false,
  contraAccountRule: 'contra_not_applicable',
  adjunctAccountRule: 'adjunct_not_applicable',
  openingBalanceDate: null,
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  balance: { amount: 100, currencyCode: 'USD', isMinorUnit: false },

  name: 'Consulting services',
  code: '40001',
  type: 'revenue',
  subType: 'services',
  status: 'active',
  functionalBalance: {
    amount: 840000000,
    currencyCode: 'NGN',
    isMinorUnit: true,
  },
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
          id: 'rent',
          name: 'Rent',
          type: 'expense',
          subType: 'rent_and_utilities',
          behavior: 'rent_and_utilities',
          status: 'archived',
          functionalBalance: {
            ...categoryAccount.functionalBalance,
            amount: 0,
          },
        },
        {
          ...categoryAccount,
          id: 'suspense',
          name: 'Uncategorized receipts',
          type: 'asset',
          subType: 'suspense',
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
