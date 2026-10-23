import fixtures from '@/accounting/pages/legal-entity-details/__stories__/fixtures.json';
import {
  FiscalYearSummary,
  FiscalYearSummarySkeleton,
} from '@/accounting/pages/legal-entity-details/parts/fiscal-year-summary';
import type { IFiscalYear } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';
const year = fixtures.year as IFiscalYear;

const meta = {
  title: 'Accounting/Legal Entity Details/FiscalYearSummary',
  component: FiscalYearSummary,
  tags: ['autodocs'],
  args: { years: [year], selected: year, onChange: () => {} },
} satisfies Meta<typeof FiscalYearSummary>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Closed: TStory = {
  args: { selected: { ...year, status: 'closed' } },
};

export const Skeleton: TStory = { render: () => <FiscalYearSummarySkeleton /> };
