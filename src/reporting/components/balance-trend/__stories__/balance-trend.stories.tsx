const labels = {
  chartLabel: 'Balance growth',
  balanceLabel: 'Total balance',
  dateLabel: 'Date',
  dataLabel: 'View chart data',
  emptyTitle: 'No balance history yet',
  inactiveTitle: 'No balance activity yet',
  emptyDescription:
    'Growth will appear once balances are recorded on different dates.',
  loadingLabel: 'Loading balance history',
  errorTitle: 'Couldn’t load balance history',
  errorDescription: 'Refresh the page to try again.',
};

import {
  BalanceTrendError,
  BalanceTrendSkeleton,
  BalanceTrendWithState,
} from '@/reporting/components/balance-trend';

const money = {
  amount: 12480000,
  currencyCode: 'NGN',
  isMinorUnit: false,
};

import { BalanceTrend } from '@/reporting/components/balance-trend';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/BalanceTrend',
  component: BalanceTrend,
  tags: ['autodocs'],
  args: {
    labels,
    points: [
      { date: '2026-04-23', amount: { ...money, amount: 10400000 } },
      { date: '2026-07-23', amount: { ...money, amount: 11420000 } },
      { date: '2026-10-23', amount: money },
    ],
  },
} satisfies Meta<typeof BalanceTrend>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoHistory: Story = { args: { points: [] } };
export const ZeroActivity: Story = {
  args: {
    labels,
    points: [
      { date: '2026-04-23', amount: { ...money, amount: 0 } },
      { date: '2026-10-23', amount: { ...money, amount: 0 } },
    ],
  },
};
export const NegativeBalance: Story = {
  args: {
    labels,
    points: [
      { date: '2026-04-23', amount: { ...money, amount: -1000000 } },
      { date: '2026-10-23', amount: { ...money, amount: -3000000 } },
    ],
  },
};

export const Skeleton: Story = {
  render: () => <BalanceTrendSkeleton label={labels.loadingLabel} />,
};
export const Error: Story = {
  render: () => (
    <BalanceTrendError
      title={labels.errorTitle}
      description={labels.errorDescription}
    />
  ),
};

export const Stateful: Story = {
  render: (args) => (
    <BalanceTrendWithState labels={labels} points={args.points} />
  ),
};
export const StatefulLoading: Story = {
  render: () => <BalanceTrendWithState labels={labels} state="loading" />,
};
export const StatefulError: Story = {
  render: () => <BalanceTrendWithState labels={labels} state="error" />,
};
export const MissingData: Story = {
  render: () => <BalanceTrendWithState labels={labels} />,
};
