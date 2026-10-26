import { BalanceHistory } from '@/account/pages/account-dashboard/parts/balance-history';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/BalanceHistory',
  component: BalanceHistory,
  tags: ['autodocs'],
  args: {
    period: '6M',
    onPeriodChange: () => {},
    history: {
      period: { from: '2026-04-24', to: '2026-10-23' },
      points: [
        {
          date: '2026-04-24',
          amount: {
            amount: 80000000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
        {
          date: '2026-10-23',
          amount: {
            amount: 87450000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
      ],
    },
    loading: false,
    error: false,
  },
} satisfies Meta<typeof BalanceHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true, history: undefined } };
export const Error: Story = { args: { error: true, history: undefined } };
