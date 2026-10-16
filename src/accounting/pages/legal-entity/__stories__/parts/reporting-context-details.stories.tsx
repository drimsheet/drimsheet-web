import { ReportingContextDetails } from '@/accounting/pages/legal-entity/parts/reporting-context-details';
import type {
  IAccountingContextDto,
  IAccountingEntity,
  IReportingContextDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const entity: IAccountingEntity = {
  id: 'entity-1' as TEntityId,
  createdBy: 'user-1' as TEntityId,
  ownerId: 'user-1' as TEntityId,
  name: 'Northstar Studio',
  status: 'active',
  type: 'private_company',
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const accountingContext: IAccountingContextDto = {
  id: 'accounting-1',
  createdBy: entity.createdBy,
  name: 'Statutory books',
  description: null,
  accountingEntityId: entity.id,
  accountingStandardCode: 'IFRS',
  fiscalYearId: 'fy-2026',
  currentAccountingPeriodId: 'oct-2026',
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
  closedAt: null,
  fiscalYear: {
    id: 'fy-2026',
    createdBy: entity.createdBy,
    name: 'FY 2026',
    accountingEntityId: entity.id,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
    status: 'open',
    closedAt: null,
    updatedAt: entity.updatedAt,
  },
  accountingPeriods: [
    {
      id: 'oct-2026',
      createdBy: entity.createdBy,
      name: 'October 2026',
      accountingEntityId: entity.id,
      fiscalYearId: 'fy-2026',
      unit: 'month',
      count: 1,
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-10-31T00:00:00Z',
      status: 'open',
      closedAt: null,
      updatedAt: entity.updatedAt,
    },
  ],
};

const reportingContext: IReportingContextDto = {
  id: 'reporting-1',
  createdBy: entity.createdBy,
  name: 'Management reporting',
  description: null,
  accountingEntityId: entity.id,
  accountingStandardCode: 'IFRS',
  accountingContextId: accountingContext.id,
  reportingCurrencyCode: 'USD',
  currentReportingPeriodId: 'q4-2026',
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
  closedAt: null,
  fiscalYear: accountingContext.fiscalYear,
  reportingPeriods: [
    {
      id: 'q4-2026',
      createdBy: entity.createdBy,
      name: 'Q4 2026',
      accountingEntityId: entity.id,
      fiscalYearId: 'fy-2026',
      unit: 'quarter',
      count: 1,
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
      updatedAt: entity.updatedAt,
    },
  ],
};

const meta = {
  title: 'Accounting/Legal Entity/ReportingContextDetails',
  component: ReportingContextDetails,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { context: reportingContext },
} satisfies Meta<typeof ReportingContextDetails>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const MissingPeriod: TStory = {
  args: { context: { ...reportingContext, reportingPeriods: [] } },
};
export const Closed: TStory = {
  args: { context: { ...reportingContext, closedAt: '2026-12-31T00:00:00Z' } },
};
