import { CashFlowPeriod } from '@/account/pages/account-details/parts/cash-flow-period';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/CashFlowPeriod',
  component: CashFlowPeriod,
  tags: ['autodocs'],
  args: {
    period: '2026-10',
    periods: [
      { value: '2026-10', label: 'October 2026' },
      { value: '2026-09', label: 'September 2026' },
    ],
    onPeriodChange: () => {},
  },
} satisfies Meta<typeof CashFlowPeriod>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
