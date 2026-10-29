import { CashflowCalendarWithState } from '@/reporting/components/cashflow-calendar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowCalendar/States',
  component: CashflowCalendarWithState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    date: new Date(2026, 9, 26),
    today: new Date(2026, 9, 26),
    loadingLabel: 'Loading cash flow',
    labels: {
      calendarLabel: 'Cash flow',
      previousLabel: 'Previous period',
      nextLabel: 'Next period',
      inflowLabel: 'Inflow',
      outflowLabel: 'Outflow',
    },
    onDateChange: () => {},
    days: [],
  },
} satisfies Meta<typeof CashflowCalendarWithState>;

export default meta;
type Story = StoryObj<typeof meta>;
export const LoadingMonth: Story = { args: { state: 'loading' } };
export const LoadingWeek: Story = {
  args: { state: 'loading', variant: 'week' },
};
export const ErrorMonths: Story = {
  args: { state: 'error', variant: 'month' },
};
export const MissingData: Story = { args: { days: null } };
export const Empty: Story = {};

export const ErrorWeek: Story = { args: { state: 'error', variant: 'week' } };
