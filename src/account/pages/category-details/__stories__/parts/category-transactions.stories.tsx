import {
  CategoryTransactions,
  CategoryTransactionsSkeleton,
  CategoryTransactionsWithState,
} from '@/account/pages/category-details/parts/category-transactions';
import type { ICategoryTransaction } from '@/account/pages/category-details/types';
import type { IJournalEntryListDto, TEntityId } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { fn } from 'storybook/test';

const transactions: ICategoryTransaction[] = [
  {
    id: 'entry-1',
    effectiveDate: '2026-06-28T00:00:00Z',
    description: 'Monthly subscription',
    counterparties: [{ id: 'google', name: 'Google' }],
    amount: { amount: 125000, currencyCode: 'NGN', isMinorUnit: false },
    status: 'posted',
  },
];

const entries: IJournalEntryListDto[] = transactions.map((row) => ({
  id: row.id,
  accountingEntityId: 'entity',
  sourceType: 'expense',
  status: 'posted',
  memo: row.description,
  effectiveDate: row.effectiveDate,
  postedAt: row.effectiveDate,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: 'user' as TEntityId,
  createdAt: row.effectiveDate,
  updatedAt: row.effectiveDate,
  attachments: [],
  lines: [],
}));

const meta = {
  title: 'Account/Category details/Transactions',
  component: CategoryTransactions,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    entries,
    total: 11,
    transactionsHref: '/transactions/list',
    selectedCounterparty: null,
    onClearCounterparty: fn(),
  },
} satisfies Meta<typeof CategoryTransactions>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Empty: TStory = { args: { entries: [], total: 0 } };
export const Filtered: TStory = {
  args: {
    entries: entries.slice(0, 1),
    selectedCounterparty: 'Google',
  },
};

export const Skeleton: TStory = {
  render: () => <CategoryTransactionsSkeleton />,
};

export const Error: TStory = {
  render: (args) => (
    <CategoryTransactionsWithState loading={false} error>
      <CategoryTransactions {...args} />
    </CategoryTransactionsWithState>
  ),
};
