import { CounterpartyProfileActions } from '@/counterparty/components/counterparty-details/parts/profile-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartyDetails/Parts/ProfileActions',
  component: CounterpartyProfileActions,
  tags: ['autodocs'],
  args: { onEdit: () => {}, onDelete: () => {}, deletable: true },
} satisfies Meta<typeof CounterpartyProfileActions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CheckingEligibility: Story = {
  args: { deleteEligibilityChecking: true },
};
export const Unavailable: Story = { args: { deletable: false } };
export const Archived: Story = { args: { editDisabled: true } };
