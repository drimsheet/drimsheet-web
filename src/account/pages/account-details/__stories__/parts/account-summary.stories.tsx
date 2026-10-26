import {
  LedgerAccountSummary,
  LedgerAccountSummarySkeleton,
} from '@/account/pages/account-details/parts/account-summary';
import type { Meta, StoryObj } from '@storybook/react-vite';

const account = {
  balance: { amount: 2450000, currencyCode: 'NGN', isMinorUnit: false },
  functionalBalance: {
    amount: 2450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const meta = {
  title: 'Ledger Accounts/LedgerAccountSummary',
  component: LedgerAccountSummary,
  args: { account },
  tags: ['autodocs'],
} satisfies Meta<typeof LedgerAccountSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ForeignCurrency: Story = {
  args: {
    account: {
      ...account,
      balance: { amount: 150000, currencyCode: 'USD', isMinorUnit: true },
    },
  },
};
export const ZeroBalance: Story = {
  args: {
    account: {
      balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      functionalBalance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
    },
  },
};
export const ExcludingSubAccounts: Story = { args: { hasSubAccounts: true } };
export const NarrowWithNegativeBalance: Story = {
  args: {
    account: {
      balance: { amount: -150000, currencyCode: 'USD', isMinorUnit: true },
      functionalBalance: {
        amount: -2450000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
};
export const Skeleton: Story = {
  render: () => <LedgerAccountSummarySkeleton />,
};
