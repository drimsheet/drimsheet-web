import { IntervalOptions } from '@/shared/components/interval-select/parts/interval-options';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const period = {
  ordinal: 0,
  name: 'January 2026',
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
};

const meta = {
  title: 'Shared UI/IntervalSelect/IntervalOptions',
  component: IntervalOptions,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    interval: {
      periods: [period],
      startDate: period.startDate,
      endDate: new Date(2026, 11, 31),
    },
    selection: {
      type: 'period',
      ordinal: 0,
      startDate: period.startDate,
      endDate: period.endDate,
    },
    onChange: fn(),
  },
} satisfies Meta<typeof IntervalOptions>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Periods: TStory = {};
export const CustomOnly: TStory = {
  args: { interval: undefined, selection: { type: 'custom' } },
};
export const AllTime: TStory = {
  args: {
    selection: {
      type: 'all-time',
      startDate: period.startDate,
      endDate: new Date(2026, 11, 31),
    },
  },
};
