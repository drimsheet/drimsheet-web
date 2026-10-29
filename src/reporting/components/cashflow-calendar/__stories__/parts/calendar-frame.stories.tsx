import { CalendarFrame } from '@/reporting/components/cashflow-calendar/parts/calendar-frame';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowCalendar/Frame',
  component: CalendarFrame,
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
    children: (
      <tr>
        <td colSpan={7} className="h-24" />
      </tr>
    ),
  },
} satisfies Meta<typeof CalendarFrame>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Month: Story = {};
export const Week: Story = { args: { variant: 'week' } };
