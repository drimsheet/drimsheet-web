import { IntervalSelect } from '@/shared/components/interval-select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';

const interval = {
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 11, 31),
  currentPeriodOrdinal: 2,
  periods: [
    {
      ordinal: 1,
      name: 'January 2026',
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 31),
    },
    {
      ordinal: 2,
      name: 'February 2026',
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 28),
    },
  ],
};

const meta = {
  title: 'Shared UI/IntervalSelect',
  component: IntervalSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { interval, onChange: fn() },
} satisfies Meta<typeof IntervalSelect>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const CurrentPeriod: TStory = {};
export const AllTime: TStory = {
  args: { interval: { ...interval, currentPeriodOrdinal: undefined } },
};
export const UnrestrictedCustom: TStory = { args: { interval: undefined } };
export const StartBoundaryOnly: TStory = {
  args: { interval: { periods: [], startDate: interval.startDate } },
};
export const EndBoundaryOnly: TStory = {
  args: { interval: { periods: [], endDate: interval.endDate } },
};
export const EmptyPeriods: TStory = { args: { interval: { periods: [] } } };
export const MissingCurrentPeriod: TStory = {
  args: { interval: { ...interval, currentPeriodOrdinal: 99 } },
};
export const Disabled: TStory = { args: { disabled: true } };
export const OpenPicker: TStory = {
  parameters: { layout: 'padded' },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Interval' })
    );
  },
};
