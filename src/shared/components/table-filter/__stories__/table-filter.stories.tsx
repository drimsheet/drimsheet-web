import { TableFilter } from '@/shared/components/table-filter';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Shared UI/TableFilter',
  component: TableFilter,
  tags: ['autodocs'],
  args: {
    title: 'Account',
    options: [
      { label: 'Operating', value: 'operating' },
      { label: 'Savings', value: 'savings' },
    ],
    selectedValues: [],
    onApply: () => {},
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TableFilter>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithSelected: Story = { args: { selectedValues: ['savings'] } };
export const Disabled: Story = { args: { disabled: true } };
export const Interactive: Story = {
  render: function Interactive(args) {
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
      []
    );

    return (
      <TableFilter
        {...args}
        selectedValues={selectedValues}
        onApply={setSelectedValues}
      />
    );
  },
};
