import { CategoryActions } from '@/account/pages/category-details/parts/category-actions';
import {
  CategorySummary,
  CategorySummarySkeleton,
} from '@/account/pages/category-details/parts/category-summary';
import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const category: ILedgerAccountDto = {
  id: 'software' as TEntityId,
  accountingEntityId: 'entity' as TEntityId,
  code: '500001',
  materializedPath: '500001',
  type: 'expense',
  normalBalance: 'debit',
  subType: 'admin_and_general',
  behavior: 'admin_and_general',
  isControlAccount: false,
  name: 'Software & subscriptions',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: 'user' as TEntityId,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-28T00:00:00Z',
  balance: { amount: 2400000, currencyCode: 'NGN', isMinorUnit: false },
  functionalBalance: {
    amount: 2400000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const meta = {
  title: 'Account/Category details/Summary',
  component: CategorySummary,
  tags: ['autodocs'],
  args: {
    account: category,
    transactionCount: 48,
    actions: (
      <CategoryActions
        accountName={category.name}
        onEdit={() => undefined}
        onArchive={async () => undefined}
      />
    ),
  },
} satisfies Meta<typeof CategorySummary>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Expense: TStory = {};
export const Revenue: TStory = {
  args: {
    account: { ...category, type: 'revenue', name: 'Consulting income' },
  },
};
export const Loading: TStory = { args: { transactionCount: undefined } };
export const Unavailable: TStory = { args: { transactionCount: null } };
export const Archived: TStory = {
  args: {
    account: { ...category, status: 'archived' },
    actions: (
      <CategoryActions
        accountName={category.name}
        onEdit={() => undefined}
        onArchive={async () => undefined}
        editDisabled
        archiveDisabled
      />
    ),
  },
};

export const Skeleton: TStory = { render: () => <CategorySummarySkeleton /> };
