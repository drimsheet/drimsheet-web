import { CashflowByCurrency } from '@/reporting/components/cashflow-by-currency';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowByCurrency',
  component: CashflowByCurrency,
  tags: ['autodocs'],
  args: {
    in: { amount: 8270, currencyCode: 'USD', isMinorUnit: false },
    out: { amount: 3275, currencyCode: 'USD', isMinorUnit: false },
  },
} satisfies Meta<typeof CashflowByCurrency>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Zero: Story = {
  args: {
    in: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
    out: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
};
export const CurrencyMismatch: Story = {
  args: { out: { amount: 3275, currencyCode: 'GBP', isMinorUnit: false } },
};
export const Currencies: Story = {
  render: () => (
    <div className="flex flex-wrap gap-x-24 gap-y-6">
      <CashflowByCurrency
        in={{ amount: 440000, currencyCode: 'NGN', isMinorUnit: false }}
        out={{ amount: 75000, currencyCode: 'NGN', isMinorUnit: false }}
      />
      <CashflowByCurrency
        in={{ amount: 8270, currencyCode: 'USD', isMinorUnit: false }}
        out={{ amount: 3275, currencyCode: 'USD', isMinorUnit: false }}
      />
      <CashflowByCurrency
        in={{ amount: 2000, currencyCode: 'GBP', isMinorUnit: false }}
        out={{ amount: 7000, currencyCode: 'GBP', isMinorUnit: false }}
      />
    </div>
  ),
};
