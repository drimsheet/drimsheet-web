import { ContractorFormSkeleton } from '@/counterparty/components/contractor-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/ContractorForm/Skeleton',
  component: ContractorFormSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof ContractorFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
