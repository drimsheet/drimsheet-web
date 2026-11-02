import {
  CategorySummary,
  CategorySummarySkeleton,
} from '@/account/pages/categories/parts/category-summary';
import type { Meta, StoryObj } from '@storybook/react-vite';

const money = { amount: 12000000, currencyCode: 'NGN', isMinorUnit: false };

const meta = {
  title: 'Ledger Accounts/Categories/Summary',
  component: CategorySummary,
  tags: ['autodocs'],
  args: {
    summary: {
      revenue: money,
      expenses: { ...money, amount: 8100000 },
      uncategorized: { ...money, amount: 450000 },
    },
  },
} satisfies Meta<typeof CategorySummary>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ZeroActivity: Story = {
  args: {
    summary: {
      revenue: { ...money, amount: 0 },
      expenses: { ...money, amount: 0 },
      uncategorized: { ...money, amount: 0 },
    },
  },
};
export const Skeleton: Story = { render: () => <CategorySummarySkeleton /> };
