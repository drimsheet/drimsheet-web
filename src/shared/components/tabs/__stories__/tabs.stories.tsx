import { Tabs } from '@/shared/components/tabs';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';

const meta = {
  title: 'Shared/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    const handleValueChange = (value: string) => {
      args.onValueChange(value);
      updateArgs({ value });
    };

    return <Tabs {...args} onValueChange={handleValueChange} />;
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Transaction type',
    value: 'inflow',
    items: [
      { value: 'inflow', label: 'Inflow' },
      { value: 'outflow', label: 'Outflow' },
      { value: 'transfer', label: 'Transfer' },
    ],
    onValueChange: () => undefined,
  },
};

export const UnequalWidths: Story = {
  args: {
    ...Default.args,
    items: [
      { value: 'inflow', label: 'Inflow' },
      { value: 'outflow', label: 'Outgoing payments', disabled: true },
      { value: 'transfer', label: 'Transfers between accounts' },
    ],
  },
};
