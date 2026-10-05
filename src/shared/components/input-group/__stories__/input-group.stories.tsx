import { Input } from '@/shared/components/input';
import { InputGroup } from '@/shared/components/input-group';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup>
      <div className="flex items-center px-3 border-r bg-muted">https://</div>
      <Input
        type="text"
        placeholder="example.com"
        className="border-0 focus-visible:ring-0"
      />
    </InputGroup>
  ),
};
