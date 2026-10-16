import { CategoryDeleteConfirmation } from '@/account/pages/category-details/parts/category-delete-confirmation';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

const meta = {
  title: 'Account/Category details/Delete confirmation',
  component: CategoryDeleteConfirmation,
  tags: ['autodocs'],
  args: {
    accountName: 'Software & subscriptions',
    onDelete: fn(),
    onOpenChange: fn(),
    open: true,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);

    return (
      <CategoryDeleteConfirmation
        {...args}
        onOpenChange={setOpen}
        open={open}
      />
    );
  },
} satisfies Meta<typeof CategoryDeleteConfirmation>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};
