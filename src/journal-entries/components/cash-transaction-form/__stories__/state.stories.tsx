import { CashTransactionFormSkeleton } from '@/journal-entries/components/cash-transaction-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/CashTransactionForm/Skeleton',
  component: CashTransactionFormSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CashTransactionFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
