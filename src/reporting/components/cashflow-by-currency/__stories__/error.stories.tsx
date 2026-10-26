import { CashflowByCurrencyError } from '@/reporting/components/cashflow-by-currency';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowByCurrency/Error',
  component: CashflowByCurrencyError,
  tags: ['autodocs'],
} satisfies Meta<typeof CashflowByCurrencyError>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
