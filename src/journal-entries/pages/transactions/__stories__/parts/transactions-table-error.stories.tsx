import { TransactionsTableError } from '@/journal-entries/pages/transactions/parts/transactions-table-error';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/Transactions/Table error',
  component: TransactionsTableError,
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionsTableError>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
