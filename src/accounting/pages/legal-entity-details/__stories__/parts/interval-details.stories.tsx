import fixtures from '@/accounting/pages/legal-entity-details/__stories__/fixtures.json';
import { IntervalDetails } from '@/accounting/pages/legal-entity-details/parts/interval-details';
import type {
  IAccountingInterval,
  IReportingInterval,
} from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
const accountingInterval = fixtures.accountingInterval as IAccountingInterval;
const now = fixtures.now;
const reportingInterval = fixtures.reportingInterval as IReportingInterval;

const meta = {
  title: 'Accounting/Legal Entity Details/IntervalDetails',
  component: IntervalDetails,
  tags: ['autodocs'],
  args: { kind: 'accounting', interval: accountingInterval, now },
} satisfies Meta<typeof IntervalDetails>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Reporting: TStory = {
  args: { kind: 'reporting', interval: reportingInterval },
};
export const NoCurrentPeriod: TStory = {
  args: { now: Date.parse('2027-01-01') },
};
