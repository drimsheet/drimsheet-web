import { CounterpartyDeleteConfirmation } from '@/counterparty/dialogs/counterparty-deletion/parts/counterparty-delete-confirmation';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

const meta = {
  title:
    'Counterparty/Dialogs/CounterpartyDeletion/Parts/CounterpartyDeleteConfirmation',
  component: CounterpartyDeleteConfirmation,
  tags: ['autodocs'],
  args: {
    counterpartyName: 'Adenike Supplies',
    onDelete: fn(),
    onOpenChange: fn(),
    open: true,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);

    return (
      <CounterpartyDeleteConfirmation
        {...args}
        onOpenChange={setOpen}
        open={open}
      />
    );
  },
} satisfies Meta<typeof CounterpartyDeleteConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
