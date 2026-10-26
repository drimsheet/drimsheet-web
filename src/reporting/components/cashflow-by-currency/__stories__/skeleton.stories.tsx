import { CashflowByCurrencySkeleton } from '@/reporting/components/cashflow-by-currency';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/CashflowByCurrency/Skeleton',
  component: CashflowByCurrencySkeleton,
  tags: ['autodocs'],
  args: { 'aria-label': 'Loading cash flow' },
} satisfies Meta<typeof CashflowByCurrencySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
