import { OverviewWithState } from '@/counterparty/pages/counterparty-details/parts/overview';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/Pages/CounterpartyDetails/Overview',
  component: OverviewWithState,
  tags: ['autodocs'],
  args: {
    loading: false,
    error: false,
    participation: {
      counterpartyId: 'one',
      fiscalYearId: 'year',
      period: { from: '2026-01-01', to: '2026-12-31' },
      revenue: { amount: 31000000, currencyCode: 'NGN', isMinorUnit: true },
      expense: { amount: 248000000, currencyCode: 'NGN', isMinorUnit: true },
    },
  },
} satisfies Meta<typeof OverviewWithState>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = {
  args: { loading: true, participation: undefined },
};
export const Error: Story = { args: { error: true, participation: undefined } };
export const NoActivity: Story = {
  args: {
    participation: {
      ...meta.args.participation,
      revenue: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
      expense: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
    },
  },
};
export const Reversal: Story = {
  args: {
    participation: {
      ...meta.args.participation,
      revenue: { amount: -310000, currencyCode: 'NGN', isMinorUnit: true },
    },
  },
};
