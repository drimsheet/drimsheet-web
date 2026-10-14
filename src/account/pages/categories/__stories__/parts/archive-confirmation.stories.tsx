import { CategoryArchiveConfirmation } from '@/account/pages/categories/parts/archive-confirmation';
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
  title: 'Ledger Accounts/Categories/ArchiveConfirmation',
  component: CategoryArchiveConfirmation,
  tags: ['autodocs'],
  args: {
    account: categoryAccount,
    pending: false,
    error: false,
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof CategoryArchiveConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Pending: Story = { args: { pending: true } };
export const Failure: Story = { args: { error: true } };
