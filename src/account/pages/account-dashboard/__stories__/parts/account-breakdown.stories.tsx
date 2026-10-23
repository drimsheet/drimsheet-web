import type { IAssetLiabilityAccountParticipationDto } from '@/shared/lib/api/Api';

const money = {
  amount: 12480000,
  currencyCode: 'NGN',
  isMinorUnit: false,
};

const account: IAssetLiabilityAccountParticipationDto = {
  accountId: 'operating',
  accountName: 'Operating',
  code: '10001',
  type: 'asset',
  subType: 'cash_and_cash_equivalent',
  status: 'active',
  amount: { ...money, amount: 5400000 },
  sharePercentage: 34.44,
};

import { AccountBreakdown } from '@/account/pages/account-dashboard/parts/account-breakdown';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountBreakdown',
  component: AccountBreakdown,
  tags: ['autodocs'],
  args: {
    type: 'asset',
    accounts: Array.from({ length: 20 }, (_, i) => ({
      ...account,
      accountId: String(i),
      accountName: `Account ${i + 1}`,
    })),
    loading: false,
    error: false,
    hasMore: true,
    loadingMore: false,
    onLoadMore: () => {},
    onRetry: () => {},
    onViewAccount: () => {},
  },
} satisfies Meta<typeof AccountBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { accounts: [], hasMore: false } };
export const Loading: Story = {
  args: { accounts: [], loading: true, hasMore: false },
};
export const Error: Story = { args: { accounts: [], error: true } };
export const Liabilities: Story = { args: { type: 'liability' } };
export const ZeroBalance: Story = {
  args: {
    accounts: [
      {
        ...account,
        amount: { ...account.amount, amount: 0 },
        sharePercentage: null,
      },
    ],
    hasMore: false,
  },
};
export const SignedShares: Story = {
  args: {
    accounts: [
      {
        ...account,
        amount: { ...account.amount, amount: -200 },
        sharePercentage: -20,
      },
      { ...account, accountId: 'positive', sharePercentage: 120 },
    ],
    hasMore: false,
  },
};
