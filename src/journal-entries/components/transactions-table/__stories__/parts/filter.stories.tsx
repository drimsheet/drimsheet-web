import type { IJournalEntryTableFilters } from '@/journal-entries/components/transactions-table';
import { JournalEntryTableFilter } from '@/journal-entries/components/transactions-table/parts/filter';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Journal Entries/TransactionsTable/Filter',
  component: JournalEntryTableFilter,
  tags: ['autodocs'],
  args: {
    value: {},
    search: '',
    onSearchChange: () => {},
    onApply: () => {},
    options: {
      accounts: [{ value: 'cash', label: 'Operating account' }],
      categories: [{ value: 'rent', label: 'Office rent' }],
      counterparties: [{ value: 'acme', label: 'Acme Studio' }],
      currencies: [
        { value: 'NGN', label: 'NGN' },
        { value: 'USD', label: 'USD' },
      ],
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState<IJournalEntryTableFilters>(args.value);
    const [search, setSearch] = useState(args.search);

    return (
      <JournalEntryTableFilter
        {...args}
        value={value}
        onApply={setValue}
        search={search}
        onSearchChange={setSearch}
      />
    );
  },
} satisfies Meta<typeof JournalEntryTableFilter>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Applied: Story = {
  args: {
    value: {
      sourceType: 'receipt',
      accountId: 'cash',
      effectiveDateFrom: '2026-10-01',
      effectiveDateTo: '2026-10-29',
    },
  },
};
export const Loading: Story = { args: { optionsLoading: true } };
export const Error: Story = { args: { optionsError: true } };
export const Empty: Story = {
  args: {
    options: {
      accounts: [],
      categories: [],
      counterparties: [],
      currencies: [],
    },
  },
};
