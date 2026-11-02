import {
  CategorySummary,
  CategorySummarySkeleton,
  CategorySummaryWithState,
} from '@/account/pages/category-details/parts/category-summary';
import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

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
    period: '6',
    onPeriodChange: fn(),
    balance: category.functionalBalance,
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
export const Loading: TStory = {
  args: { transactionCount: undefined, balance: undefined },
};
export const Unavailable: TStory = {
  args: { transactionCount: null, balance: null },
};
export const Archived: TStory = {
  args: {
    account: { ...category, status: 'archived' },
  },
};

export const Skeleton: TStory = {
  render: () => <CategorySummarySkeleton showPeriod />,
};

export const Error: TStory = {
  render: (args) => (
    <CategorySummaryWithState loading={false} error showPeriod>
      <CategorySummary {...args} />
    </CategorySummaryWithState>
  ),
};
