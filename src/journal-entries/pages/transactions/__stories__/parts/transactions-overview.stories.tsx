import {
  TransactionsOverview,
  TransactionsOverviewError,
  TransactionsOverviewSkeleton,
} from '@/journal-entries/pages/transactions/parts/transactions-overview';
import currencies from '@/shared/configs/currencies.json';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/Transactions/Overview',
  component: TransactionsOverview,
  tags: ['autodocs'],
  args: {
    inflow: { amount: 11063, currencyCode: 'USD', isMinorUnit: false },
    outflow: { amount: 12075, currencyCode: 'USD', isMinorUnit: false },
    currencies: [
      {
        currencyCode: 'NGN',
        logo: currencies.find(({ code }) => code === 'NGN')?.logo,
        inflow: { amount: 440000, currencyCode: 'NGN', isMinorUnit: false },
        outflow: { amount: -75000, currencyCode: 'NGN', isMinorUnit: false },
      },
      {
        currencyCode: 'USD',
        logo: currencies.find(({ code }) => code === 'USD')?.logo,
        inflow: { amount: 8270, currencyCode: 'USD', isMinorUnit: false },
        outflow: { amount: -3275, currencyCode: 'USD', isMinorUnit: false },
      },
      {
        currencyCode: 'GBP',
        logo: currencies.find(({ code }) => code === 'GBP')?.logo,
        inflow: { amount: 2000, currencyCode: 'GBP', isMinorUnit: false },
        outflow: { amount: -7000, currencyCode: 'GBP', isMinorUnit: false },
      },
    ],
  },
} satisfies Meta<typeof TransactionsOverview>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { currencies: [] } };
export const Loading: Story = {
  render: () => <TransactionsOverviewSkeleton />,
};
export const Error: Story = { render: () => <TransactionsOverviewError /> };
export const Reversals: Story = {
  args: {
    currencies: [
      {
        currencyCode: 'USD',
        inflow: { amount: -100, currencyCode: 'USD', isMinorUnit: false },
        outflow: { amount: 200, currencyCode: 'USD', isMinorUnit: false },
      },
    ],
  },
};
