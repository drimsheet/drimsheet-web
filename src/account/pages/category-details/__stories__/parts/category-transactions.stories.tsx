import { CategoryTransactions } from '@/account/pages/category-details/parts/category-transactions';
import type { ICategoryTransaction } from '@/account/pages/category-details/types';
import type { Meta, StoryObj } from '@storybook/react-vite';
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

const meta = {
  title: 'Account/Category details/Transactions',
  component: CategoryTransactions,
  tags: ['autodocs'],
  args: { transactions, selectedCounterparty: null, onClearCounterparty: fn() },
} satisfies Meta<typeof CategoryTransactions>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Empty: TStory = { args: { transactions: [] } };
export const Filtered: TStory = {
  args: {
    transactions: transactions.slice(0, 1),
    selectedCounterparty: 'Google',
  },
};
