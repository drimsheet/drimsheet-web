import { PeriodNameFields } from '@/accounting/components/period-name-fields';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Period Name Fields',
  component: PeriodNameFields,
  tags: ['autodocs'],
  args: {
    title: 'Name your accounting periods',
    currentDate: '2026-10-22',
    unit: 'quarter',
    disabled: false,
    getError: () => [],
    onNameChange: () => {},
    onNameBlur: () => {},
    periods: [
      { name: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31' },
      { name: 'Q2', startDate: '2026-04-01', endDate: '2026-06-30' },
      { name: 'Q3', startDate: '2026-07-01', endDate: '2026-09-30' },
      { name: 'Q4', startDate: '2026-10-01', endDate: '2026-12-31' },
    ],
  },
} satisfies Meta<typeof PeriodNameFields>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Empty: TStory = { args: { periods: [] } };
