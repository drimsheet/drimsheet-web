import { Button } from '@/shared/components/button';
import { DateRangePicker } from '@/shared/components/date-range-picker';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

const january = {
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
};

const meta = {
  title: 'Shared UI/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { onChange: fn() },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    const handleChange = (range: typeof january) => {
      setValue(range);
      args.onChange(range);
    };

    return <DateRangePicker {...args} value={value} onChange={handleChange} />;
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Empty: TStory = {};
export const WithValue: TStory = { args: { value: january } };
export const Bounded: TStory = {
  args: {
    value: january,
    minDate: january.startDate,
    maxDate: new Date(2026, 2, 31),
  },
};
export const MinimumOnly: TStory = { args: { minDate: january.startDate } };
export const MaximumOnly: TStory = { args: { maxDate: january.endDate } };
export const Disabled: TStory = { args: { value: january, disabled: true } };
export const WithSidePanel: TStory = {
  args: {
    value: january,
    renderSidePanel: ({ onChange }) => (
      <Button type="button" variant="ghost" onClick={() => onChange(january)}>
        January 2026
      </Button>
    ),
  },
};
