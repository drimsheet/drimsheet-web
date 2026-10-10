import { RecentTransactions } from '@/counterparty/pages/counterparty-details/parts/recent-transactions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/Pages/CounterpartyDetails/RecentTransactions',
  component: RecentTransactions,
  tags: ['autodocs'],
  args: { counterpartyName: 'Odion Oboite', empty: true },
} satisfies Meta<typeof RecentTransactions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const WithContent: Story = {
  args: {
    empty: false,
    children: <p>Transaction table supplied by the page.</p>,
  },
};
export const LongName: Story = {
  args: {
    counterpartyName:
      'Adenike Supplies and International Logistics Services Limited',
  },
};
