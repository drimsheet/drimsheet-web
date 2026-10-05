import { Input } from '@/shared/components/input';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Email' } };
