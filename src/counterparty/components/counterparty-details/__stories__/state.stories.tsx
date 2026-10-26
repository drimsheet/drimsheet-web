import { CounterpartyDetailsSkeleton } from '@/counterparty/components/counterparty-details';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartyDetailsSkeleton',
  component: CounterpartyDetailsSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CounterpartyDetailsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
