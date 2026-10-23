import { RecentTransactionsSkeleton } from '@/account/pages/account-details/parts/recent-transactions';
import type {
  IJournalEntryListDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';

const account: ILedgerAccountDto = {
  id: 'account-1' as TEntityId,
  code: '100001',
  materializedPath: '100001',
  accountingEntityId: 'entity-1' as TEntityId,
  type: 'asset',
  normalBalance: 'debit',
  subType: 'cash_and_cash_equivalent',
  behavior: 'bank',
  isControlAccount: false,
  name: 'Main business account',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: 'user-1' as TEntityId,
  createdAt: '2026-01-14T12:00:00Z',
  updatedAt: '2026-01-14T12:00:00Z',
  balance: { amount: 245000000, currencyCode: 'NGN', isMinorUnit: true },
  functionalBalance: {
    amount: 2450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const transaction: IJournalEntryListDto = {
  id: 'entry-1',
  accountingEntityId: account.accountingEntityId,
  sourceType: 'receipt',
  memo: 'Customer payment',
  status: 'posted',
  effectiveDate: '2026-10-12T12:00:00Z',
  postedAt: account.updatedAt,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: account.createdBy,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  attachments: [],
  lines: [
    {
      id: 'line-1',
      entryId: 'entry-1',
      account: { id: 'sales', name: 'Sales' },
      counterparty: { id: 'customer-1', name: 'Acme Studio', status: 'active' },
      sequenceOrder: 1,
      amount: { amount: 35000000, currencyCode: 'NGN', isMinorUnit: true },
      functionalAmount: {
        amount: 350000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      exchangeRate: null,
      side: 'credit',
      description: 'Customer payment',
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    },
    {
      id: 'line-2',
      entryId: 'entry-1',
      account: { id: account.id, name: account.name },
      counterparty: null,
      sequenceOrder: 2,
      amount: { amount: 35000000, currencyCode: 'NGN', isMinorUnit: true },
      functionalAmount: {
        amount: 350000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      exchangeRate: null,
      side: 'debit',
      description: null,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    },
  ],
};

import { RecentTransactions } from '@/account/pages/account-details/parts/recent-transactions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/RecentTransactions',
  component: RecentTransactions,
  tags: ['autodocs'],
  args: {
    transactions: [transaction],
    pagination: { page: 1, limit: 5, total: 6, totalPages: 2 },
    search: '',
    empty: false,
    sortDirection: 'desc',
    onSearchChange: () => {},
    onPageChange: () => {},
    onSortChange: () => {},
  },
} satisfies Meta<typeof RecentTransactions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { transactions: [], empty: true } };
export const NoSearchResults: Story = {
  args: { transactions: [], search: 'Unmatched', pagination: undefined },
};

export const Skeleton: Story = { render: () => <RecentTransactionsSkeleton /> };
