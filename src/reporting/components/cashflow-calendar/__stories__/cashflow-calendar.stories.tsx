import { CashflowCalendar } from '@/reporting/components/cashflow-calendar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Reporting/CashflowCalendar',
  component: CashflowCalendar,
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
    labels: {
      calendarLabel: 'Cash flow',
      previousLabel: 'Previous period',
      nextLabel: 'Next period',
      inflowLabel: 'Inflow',
      outflowLabel: 'Outflow',
    },
    onDateChange: () => {},
    days: [
      {
        date: '2026-10-01',
        in: { amount: 900, currencyCode: 'USD', isMinorUnit: false },
        out: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
      },
      {
        date: '2026-10-02',
        in: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
        out: { amount: 250, currencyCode: 'USD', isMinorUnit: false },
      },
      {
        date: '2026-10-05',
        in: { amount: 1800, currencyCode: 'USD', isMinorUnit: false },
        out: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
      },
      {
        date: '2026-10-16',
        in: { amount: 1500, currencyCode: 'USD', isMinorUnit: false },
        out: { amount: 210, currencyCode: 'USD', isMinorUnit: false },
      },
      {
        date: '2026-10-26',
        in: { amount: 120000, currencyCode: 'USD', isMinorUnit: true },
        out: { amount: 85, currencyCode: 'USD', isMinorUnit: false },
      },
    ],
  },
  render: function Render(args) {
    const [date, setDate] = useState(args.date);

    return <CashflowCalendar {...args} date={date} onDateChange={setDate} />;
  },
} satisfies Meta<typeof CashflowCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Month: Story = {};
export const Week: Story = { args: { variant: 'week' } };
export const Secondary: Story = { args: { color: 'secondary' } };
export const Empty: Story = { args: { days: [] } };
export const SixWeeks: Story = { args: { date: new Date(2026, 2, 1) } };
export const DarkWeek: Story = {
  args: { variant: 'week', color: 'secondary' },
  decorators: [
    (Story) => (
      <div className="dark bg-background p-4 text-foreground">
        <Story />
      </div>
    ),
  ],
};
export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
