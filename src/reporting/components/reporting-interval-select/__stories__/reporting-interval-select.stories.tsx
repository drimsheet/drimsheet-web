import { ReportingIntervalSelect } from '@/reporting/components/reporting-interval-select';
import type { IReportingInterval } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';

const interval: IReportingInterval = {
  id: 'reporting-interval',
  accountingEntityId: 'entity',
  fiscalYearId: 'year',
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-07-01T00:00:00.000Z',
  unit: 'quarter',
  count: 2,
  currentPeriodOrdinal: 1,
  nextPeriodStartDate: '2026-04-01T00:00:00.000Z',
  periods: [
    {
      id: 'q1',
      intervalId: 'reporting-interval',
      accountingEntityId: 'entity',
      createdBy: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ordinal: 1,
      name: 'Q1 2026',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-04-01T00:00:00.000Z',
    },
    {
      id: 'q2',
      intervalId: 'reporting-interval',
      accountingEntityId: 'entity',
      createdBy: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ordinal: 2,
      name: 'Q2 2026',
      startDate: '2026-04-01T00:00:00.000Z',
      endDate: '2026-07-01T00:00:00.000Z',
    },
  ],
};

const meta = {
  title: 'Reporting/ReportingIntervalSelect',
  component: ReportingIntervalSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { interval, onChange: fn() },
} satisfies Meta<typeof ReportingIntervalSelect>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const CurrentPeriod: TStory = {};
export const AllTime: TStory = {
  args: { interval: { ...interval, periods: [] } },
};
export const MissingContext: TStory = { args: { interval: null } };
export const UnavailableCurrentPeriod: TStory = {
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
