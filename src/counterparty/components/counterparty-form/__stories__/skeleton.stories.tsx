import { CounterpartyFormSkeleton } from '@/counterparty/components/counterparty-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartyForm/Skeleton',
  component: CounterpartyFormSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CounterpartyFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
