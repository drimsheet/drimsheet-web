import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/components/alert-dialog';
import { Button } from '@/shared/components/button';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Shared UI/ConfirmationDialog',
  component: ConfirmationDialog,
  tags: ['autodocs'],
  args: {
    open: false,
    title: 'Archive this item?',
    trigger: <Button>Open confirmation</Button>,
    cancelText: 'Cancel',
    confirmationText: 'Archive',
    onConfirm: fn(),
    onCancel: fn(),
    onClose: fn(),
    onOpenChange: fn(),
    children: 'You can restore this item from the archive later.',
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    const handleConfirm = () => {
      args.onConfirm();
      updateArgs({ open: false });
    };

    const handleOpenChange = (open: boolean) => {
      args.onOpenChange(open);
      updateArgs({ open });
    };

    return (
      <ConfirmationDialog
        {...args}
        onConfirm={handleConfirm}
        onOpenChange={handleOpenChange}
      />
    );
  },
} satisfies Meta<typeof ConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Destructive: Story = {
  args: {
    title: 'Delete this item?',
    children: 'This action cannot be undone.',
    confirmationText: 'Delete',
    variant: 'destructive',
  },
};
export const Loading: Story = {
  args: { open: true, loading: true, confirmationText: 'Archiving...' },
};
export const CustomFooter: Story = {
  args: {
    open: true,
    footer: (
      <>
        <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
        <AlertDialogAction size="sm" variant="outline">
          Archive instead
        </AlertDialogAction>
        <AlertDialogAction size="sm" variant="destructive">
          Delete
        </AlertDialogAction>
      </>
    ),
  },
};
