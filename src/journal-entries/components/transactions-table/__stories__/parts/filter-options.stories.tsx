import {
  JournalEntryFilterOptions,
  JournalEntryFilterOptionsSkeleton,
} from '@/journal-entries/components/transactions-table/parts/filter-options';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/TransactionsTable/Filter options',
  component: JournalEntryFilterOptions,
  tags: ['autodocs'],
  args: {
    label: 'Account',
    options: [{ value: 'cash', label: 'Operating account' }],
    onChange: () => {},
  },
} satisfies Meta<typeof JournalEntryFilterOptions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { options: [] } };
export const Error: Story = { args: { error: true } };
export const Skeleton: Story = {
  render: () => <JournalEntryFilterOptionsSkeleton />,
};
export const Currency: Story = {
  args: {
    label: 'Currency',
    select: true,
    options: [{ value: 'NGN', label: 'NGN' }],
  },
};
