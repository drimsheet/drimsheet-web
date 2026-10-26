import { AccountDeleteConfirmation } from '@/account/components/account-delete-confirmation';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

const meta = {
  title: 'Ledger Accounts/AccountDeleteConfirmation',
  component: AccountDeleteConfirmation,
  tags: ['autodocs'],
  args: {
    isControlAccount: false,
    accountName: 'Main business account',
    onDelete: fn(),
    onOpenChange: fn(),
    open: true,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);

    return (
      <AccountDeleteConfirmation {...args} onOpenChange={setOpen} open={open} />
    );
  },
} satisfies Meta<typeof AccountDeleteConfirmation>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const ControlAccount: TStory = { args: { isControlAccount: true } };
