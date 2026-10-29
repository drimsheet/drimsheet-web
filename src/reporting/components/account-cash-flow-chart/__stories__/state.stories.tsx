import {
  AccountCashFlowChartError,
  AccountCashFlowChartSkeleton,
} from '@/reporting/components/account-cash-flow-chart';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/AccountCashFlowChart/Skeleton',
  component: AccountCashFlowChartSkeleton,
  tags: ['autodocs'],
  args: { 'aria-label': 'Loading transactions chart' },
} satisfies Meta<typeof AccountCashFlowChartSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

export const Error = {
  render: () => (
    <AccountCashFlowChartError
      title="Cash flow"
      description="Unable to load this section."
    />
  ),
};
