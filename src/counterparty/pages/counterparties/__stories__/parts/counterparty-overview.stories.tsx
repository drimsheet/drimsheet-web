import {
  CounterpartyOverview,
  CounterpartyOverviewError,
  CounterpartyOverviewSkeleton,
} from '@/counterparty/pages/counterparties/parts/counterparty-overview';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/Counterparties/Overview',
  component: CounterpartyOverview,
  tags: ['autodocs'],
  args: { employers: 12, vendors: 48, contractors: 24 },
} satisfies Meta<typeof CounterpartyOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = {
  args: { employers: 0, vendors: 0, contractors: 0 },
};
export const LargeTotals: Story = {
  args: { employers: 12500, vendors: 48000, contractors: 24900 },
};
export const Loading: Story = {
  render: () => <CounterpartyOverviewSkeleton />,
};
export const Error: Story = { render: () => <CounterpartyOverviewError /> };
