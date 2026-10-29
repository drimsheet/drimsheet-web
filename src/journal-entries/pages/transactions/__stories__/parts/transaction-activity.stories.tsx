import activityDays from '@/journal-entries/pages/transactions/__stories__/activity-fixtures.json';
import { TransactionActivity } from '@/journal-entries/pages/transactions/parts/transaction-activity';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/Transactions/Activity',
  component: TransactionActivity,
  tags: ['autodocs'],
  args: {
    date: new Date(2026, 9, 1),
    today: new Date(2026, 9, 26),
    onDateChange: () => {},
    state: 'success',
    days: activityDays,
    currencyCode: 'USD',
  },
} satisfies Meta<typeof TransactionActivity>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { state: 'loading', days: undefined } };
export const Error: Story = { args: { state: 'error', days: undefined } };
export const Empty: Story = { args: { days: [] } };
