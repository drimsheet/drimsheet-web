import {
  AccountsSummary,
  AccountsSummaryError,
  AccountsSummarySkeleton,
  AccountsSummaryWithState,
} from '@/account/pages/account-dashboard/parts/account-summary';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountsSummary',
  component: AccountsSummary,
  tags: ['autodocs'],
  args: {
    summary: {
      totalFunctionalBalance: {
        amount: 87450000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      balancesByCurrency: [
        { amount: 71250000, currencyCode: 'NGN', isMinorUnit: false },
        { amount: 820000, currencyCode: 'USD', isMinorUnit: true },
        { amount: 248000, currencyCode: 'GBP', isMinorUnit: true },
        { amount: 109000, currencyCode: 'EUR', isMinorUnit: true },
        { amount: 64000, currencyCode: 'CAD', isMinorUnit: true },
        { amount: 82000, currencyCode: 'JPY', isMinorUnit: false },
      ],
    },
    change: {
      amount: {
        amount: 8400000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      percentageChange: 10.5,
      date: '2026-04-24',
    },
  },
} satisfies Meta<typeof AccountsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutGrowth: Story = { args: { change: undefined } };
export const Skeleton: Story = { render: () => <AccountsSummarySkeleton /> };
export const Error: Story = { render: () => <AccountsSummaryError /> };
export const Stateful: Story = {
  render: (args) => <AccountsSummaryWithState {...args} />,
};
export const StatefulLoading: Story = {
  render: () => <AccountsSummaryWithState state="loading" />,
};
export const StatefulError: Story = {
  render: () => <AccountsSummaryWithState state="error" />,
};
export const MissingData: Story = {
  render: () => <AccountsSummaryWithState />,
};
