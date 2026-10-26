import { CashflowByCurrencyWithState } from '@/reporting/components/cashflow-by-currency';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowByCurrency/States',
  component: CashflowByCurrencyWithState,
  tags: ['autodocs'],
  args: {
    loadingLabel: 'Loading cash flow',
    in: { amount: 8270, currencyCode: 'USD', isMinorUnit: false },
    out: { amount: 3275, currencyCode: 'USD', isMinorUnit: false },
  },
} satisfies Meta<typeof CashflowByCurrencyWithState>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Success: Story = {};
export const Loading: Story = { args: { state: 'loading' } };
export const Error: Story = { args: { state: 'error' } };
export const MissingData: Story = { args: { in: null } };
