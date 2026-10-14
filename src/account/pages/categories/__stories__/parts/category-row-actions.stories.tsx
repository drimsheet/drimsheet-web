import { CategoryRowActions } from '@/account/pages/categories/parts/category-row-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Categories/RowActions',
  component: CategoryRowActions,
  tags: ['autodocs'],
  args: {
    account: {
      accountId: 'consulting',
      accountName: 'Consulting services',
      code: '40001',
      type: 'revenue',
      subType: 'operating_revenue',
      status: 'active',
      amount: { amount: 100000, currencyCode: 'NGN', isMinorUnit: false },
      sharePercentage: 80,
      transactionCount: 12,
    },
    onViewAccount: () => {},
    onEditAccount: () => {},
    onArchiveAccount: () => {},
  },
} satisfies Meta<typeof CategoryRowActions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Archived: Story = {
  args: { account: { ...meta.args.account, status: 'archived' } },
};
export const Uncategorized: Story = {
  args: {
    account: {
      ...meta.args.account,
      type: 'asset',
      subType: 'suspense',
      accountName: 'Uncategorized payments',
      sharePercentage: null,
    },
  },
};
