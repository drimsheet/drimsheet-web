import { CashflowDay } from '@/reporting/components/cashflow-calendar/parts/cashflow-day';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowCalendar/Day',
  component: CashflowDay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <table className="w-24 text-center">
        <tbody>
          <tr>
            <Story />
          </tr>
        </tbody>
      </table>
    ),
  ],
  args: {
    date: new Date(2026, 9, 26),
    today: new Date(2026, 9, 26),
    color: 'primary',
    locale: 'en-US',
    labels: { inflowLabel: 'Inflow', outflowLabel: 'Outflow' },
    entry: {
      date: '2026-10-26',
      in: { amount: 1200, currencyCode: 'USD', isMinorUnit: false },
      out: { amount: 85, currencyCode: 'USD', isMinorUnit: false },
    },
  },
} satisfies Meta<typeof CashflowDay>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Today: Story = {};
export const Secondary: Story = { args: { color: 'secondary' } };
export const Empty: Story = { args: { entry: undefined } };
