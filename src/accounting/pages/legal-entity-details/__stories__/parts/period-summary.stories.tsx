import { PeriodSummary } from '@/accounting/pages/legal-entity-details/parts/period-summary';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity Details/PeriodSummary',
  component: PeriodSummary,
  tags: ['autodocs'],
  args: {
    name: 'October 2026',
    ordinal: 10,
    count: 12,
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-11-01T00:00:00Z',
    status: 'open',
  },
} satisfies Meta<typeof PeriodSummary>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Closed: TStory = { args: { status: 'closed' } };
export const Reporting: TStory = {
  args: {
    name: 'Q4 2026',
    ordinal: 4,
    count: 4,
    status: undefined,
    endDate: '2027-01-01T00:00:00Z',
  },
};
