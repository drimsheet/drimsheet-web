import { FileUpload } from '@/shared/components/file-upload';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Shared UI/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  args: {
    accept: ['image/jpeg', 'image/png', 'application/pdf'],
    actionText: 'Upload file',
    description: 'One file, up to 2 MB.',
    id: 'story-file-upload',
    label: 'Attach receipt',
    onValueChange: () => undefined,
    replaceText: 'Replace file',
    value: [],
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [files, setFiles] = useState<File[]>([]);

    return <FileUpload {...args} value={files} onValueChange={setFiles} />;
  },
};

export const Multiple: Story = {
  ...Interactive,
  args: {
    multiple: true,
    actionText: 'Add file',
    description: 'Up to 3 files, 5 MB each.',
  },
};

export const Invalid: Story = {
  args: { errors: [{ message: 'File must be 2 MB or smaller' }] },
};

export const Disabled: Story = {
  args: { disabled: true },
};
