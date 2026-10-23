import type {
  IAccountingEntity,
  IAccountingInterval,
  IFiscalYear,
  IReportingInterval,
} from '@/shared/lib/api/Api';

export const now = Date.parse('2026-10-23T12:00:00Z');

const audit = {
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-10-23T00:00:00Z',
};

export const entity: IAccountingEntity = {
  ...audit,
  id: '00000000-0000-4000-8000-000000000003',
  ownerId: 'user',
  name: 'Amara Studio Ltd',
  status: 'active',
  type: 'private_company',
  jurisdictionCode: 'NG',
  functionalCurrencyCode: 'NGN',
};
export const year: IFiscalYear = {
  ...audit,
  id: 'year',
  accountingEntityId: entity.id,
  name: 'FY 2026',
  status: 'open',
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-12-31T00:00:00Z',
  closedAt: null,
};
export const accountingInterval: IAccountingInterval = {
  ...audit,
  id: 'accounting-interval',
  accountingEntityId: entity.id,
  fiscalYearId: year.id,
  unit: 'month',
  count: 12,
  currentPeriodOrdinal: 10,
  startDate: year.startDate,
  endDate: '2027-01-01T00:00:00Z',
  nextPeriodStartDate: '2026-11-01T00:00:00Z',
  periods: [
    {
      ...audit,
      id: 'october',
      intervalId: 'accounting-interval',
      accountingEntityId: entity.id,
      ordinal: 10,
      name: 'October 2026',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-11-01T00:00:00Z',
      status: 'open',
      closedAt: null,
    },
  ],
};
export const reportingInterval: IReportingInterval = {
  ...accountingInterval,
  id: 'reporting-interval',
  unit: 'quarter',
  count: 4,
  currentPeriodOrdinal: 4,
  nextPeriodStartDate: '2027-01-01T00:00:00Z',
  periods: [
    {
      ...audit,
      id: 'q4',
      intervalId: 'reporting-interval',
      accountingEntityId: entity.id,
      ordinal: 4,
      name: 'Q4 2026',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2027-01-01T00:00:00Z',
    },
  ],
};
export const context = {
  accounting: {
    ...audit,
    id: 'accounting',
    accountingEntityId: entity.id,
    name: 'Statutory accounts',
    accountingStandardCode: 'IFRS',
    fiscalYearId: year.id,
    accountingIntervalId: accountingInterval.id,
    description: null,
    closedAt: null,
  },
  reporting: {
    ...audit,
    id: 'reporting',
    accountingEntityId: entity.id,
    accountingContextId: 'accounting',
    reportingIntervalId: reportingInterval.id,
    name: 'Management reports',
    reportingCurrencyCode: 'USD',
    description: null,
    closedAt: null,
  },
  accountingInterval,
  reportingInterval,
};
