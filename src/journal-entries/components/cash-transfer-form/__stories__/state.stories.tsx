import { CashTransferFormSkeleton } from '@/journal-entries/components/cash-transfer-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/CashTransferForm/Skeleton',
  component: CashTransferFormSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CashTransferFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
