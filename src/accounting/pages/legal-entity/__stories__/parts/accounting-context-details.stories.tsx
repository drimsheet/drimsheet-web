import { AccountingContextDetails } from '@/accounting/pages/legal-entity/parts/accounting-context-details';
import type {
  IAccountingContextDto,
  IAccountingEntity,
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

const meta = {
  title: 'Accounting/Legal Entity/AccountingContextDetails',
  component: AccountingContextDetails,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { context: accountingContext },
} satisfies Meta<typeof AccountingContextDetails>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const MissingPeriod: TStory = {
  args: { context: { ...accountingContext, accountingPeriods: [] } },
};
export const Closed: TStory = {
  args: { context: { ...accountingContext, closedAt: '2026-12-31T00:00:00Z' } },
};
