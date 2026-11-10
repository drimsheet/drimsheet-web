import { UploadedFile } from '@/shared/components/uploaded-file';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Shared/UploadedFile',
  component: UploadedFile,
  tags: ['autodocs'],
  args: {
    name: 'office-supplies-receipt.pdf',
    size: 34_816,
    type: 'application/pdf',
    url: 'https://example.com/office-supplies-receipt.pdf',
  },
} satisfies Meta<typeof UploadedFile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Removable: Story = {
  args: { onRemove: fn() },
};

export const Selected: Story = {
  args: { url: undefined, onRemove: fn() },
};
