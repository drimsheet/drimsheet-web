import activityDays from '@/journal-entries/pages/transactions/__stories__/activity-fixtures.json';
import {
  TransactionActivityChart,
  TransactionActivityChartWithState,
} from '@/journal-entries/pages/transactions/parts/transaction-activity-chart';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/Transactions/Activity chart',
  component: TransactionActivityChart,
  tags: ['autodocs'],
  args: { days: activityDays, currencyCode: 'USD' },
} satisfies Meta<typeof TransactionActivityChart>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = {
  render: () => <TransactionActivityChartWithState state="loading" />,
};
export const Error: Story = {
  render: () => <TransactionActivityChartWithState state="error" />,
};
export const Empty: Story = { args: { days: [] } };
export const Reversals: Story = {
  args: {
    days: [
      {
        date: '2026-10-01',
        revenue: -100,
        expense: -50,
        in: { amount: -100, currencyCode: 'USD', isMinorUnit: false },
        out: { amount: -50, currencyCode: 'USD', isMinorUnit: false },
      },
    ],
  },
};
