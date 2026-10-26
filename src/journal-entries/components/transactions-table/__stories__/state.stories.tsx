import { TransactionsTableSkeleton } from '@/journal-entries/components/transactions-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/TransactionsTable/Skeleton',
  component: TransactionsTableSkeleton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionsTableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
