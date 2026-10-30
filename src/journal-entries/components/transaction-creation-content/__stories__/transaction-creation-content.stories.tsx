import { CashTransactionFormSkeleton } from '@/journal-entries/components/cash-transaction-form';
import { TransactionCreationContent } from '@/journal-entries/components/transaction-creation-content';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/Transaction Creation Content',
  component: TransactionCreationContent,
  tags: ['autodocs'],
  args: {
    children: <CashTransactionFormSkeleton />,
    files: [],
    onUpload: () => undefined,
  },
} satisfies Meta<typeof TransactionCreationContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
