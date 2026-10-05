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
    removeText: 'Remove file',
    replaceText: 'Replace file',
    value: null,
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    return <FileUpload {...args} value={file} onValueChange={setFile} />;
  },
};

export const Invalid: Story = {
  args: { errors: [{ message: 'File must be 2 MB or smaller' }] },
};

export const Disabled: Story = {
  args: { disabled: true },
};
