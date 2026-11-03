import { RecentTransactions } from '@/counterparty/pages/counterparty-details/parts/recent-transactions';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Counterparty/Pages/CounterpartyDetails/RecentTransactions',
  component: RecentTransactions,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    counterpartyName: 'Adenike Supplies Ltd',
    empty: true,
    transactions: [],
    loading: false,
    search: '',
    sortDirection: 'desc',
    total: 0,
    transactionsHref: '/transactions?counterpartyId=one',
    onSearchChange: () => {},
    onSortChange: () => {},
  },
} satisfies Meta<typeof RecentTransactions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const Filtered: Story = { args: { empty: false, search: 'unmatched' } };
export const Loading: Story = { args: { loading: true, total: undefined } };
