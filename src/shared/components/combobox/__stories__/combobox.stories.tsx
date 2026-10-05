import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Select item..." />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="1">Option 1</ComboboxItem>
          <ComboboxItem value="2">Option 2</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};
