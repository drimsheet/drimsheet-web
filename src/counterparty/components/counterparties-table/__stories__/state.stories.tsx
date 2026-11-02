import { CounterpartiesTableError } from '@/counterparty/components/counterparties-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartiesTable/State',
  component: CounterpartiesTableError,
  tags: ['autodocs'],
} satisfies Meta<typeof CounterpartiesTableError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {};
