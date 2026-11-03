import { PickerPanel } from '@/shared/components/date-range-picker/parts/picker-panel';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Shared UI/DateRangePicker/PickerPanel',
  component: PickerPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    numberOfMonths: 2,
    value: { startDate: new Date(2026, 0, 10), endDate: new Date(2026, 0, 20) },
    onApply: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof PickerPanel>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};
export const Empty: TStory = {
  args: { value: undefined, minDate: new Date(2026, 0, 1) },
};
export const Reversed: TStory = {
  args: {
    value: { startDate: new Date(2026, 0, 20), endDate: new Date(2026, 0, 10) },
  },
};
export const OutsideBoundaries: TStory = {
  args: { minDate: new Date(2026, 0, 15) },
};
