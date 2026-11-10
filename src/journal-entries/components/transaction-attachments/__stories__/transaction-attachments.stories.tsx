import { TransactionAttachments } from '@/journal-entries/components/transaction-attachments';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/Transaction Attachments',
  component: TransactionAttachments,
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionAttachments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
