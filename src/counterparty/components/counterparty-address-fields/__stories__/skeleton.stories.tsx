import type { Meta, StoryObj } from '@storybook/react-vite';
import { CounterpartyAddressFieldsSkeleton } from '..';

const meta = {
  title: 'Counterparty/AddressFields/Skeleton',
  component: CounterpartyAddressFieldsSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CounterpartyAddressFieldsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithPostalCode: Story = { args: { showPostalCode: true } };
