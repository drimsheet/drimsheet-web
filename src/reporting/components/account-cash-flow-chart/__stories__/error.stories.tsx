import { AccountCashFlowChartError } from '@/reporting/components/account-cash-flow-chart';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/AccountCashFlowChart/Error',
  component: AccountCashFlowChartError,
  tags: ['autodocs'],
  args: { title: 'Cash flow', description: 'Unable to load this section.' },
} satisfies Meta<typeof AccountCashFlowChartError>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
