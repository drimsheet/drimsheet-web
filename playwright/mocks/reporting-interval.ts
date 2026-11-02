import type { IFiscalYear, IReportingInterval } from '@/shared/lib/api/Api';
import type { Page } from '@playwright/test';

export const reportingFiscalYear: IFiscalYear = {
  id: 'reporting-year',
  accountingEntityId: '00000000-0000-4000-8000-000000000002',
  createdBy: 'user',
  name: '2026',
  status: 'open',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
  closedAt: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const reportingInterval: IReportingInterval = {
  id: 'reporting-interval',
  accountingEntityId: reportingFiscalYear.accountingEntityId,
  fiscalYearId: reportingFiscalYear.id,
  createdBy: 'user',
  createdAt: reportingFiscalYear.updatedAt,
  updatedAt: reportingFiscalYear.updatedAt,
  unit: 'month',
  count: 12,
  currentPeriodOrdinal: 10,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2027-01-01T00:00:00.000Z',
  nextPeriodStartDate: '2026-11-01T00:00:00.000Z',
  periods: Array.from({ length: 12 }, (_, month) => ({
    id: `period-${month + 1}`,
    intervalId: 'reporting-interval',
    accountingEntityId: reportingFiscalYear.accountingEntityId,
    ordinal: month + 1,
    name: new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2026, month, 1))),
    startDate: new Date(Date.UTC(2026, month, 1)).toISOString(),
    endDate: new Date(Date.UTC(2026, month + 1, 1)).toISOString(),
    createdBy: 'user',
    createdAt: reportingFiscalYear.updatedAt,
    updatedAt: reportingFiscalYear.updatedAt,
  })),
};

export async function registerReportingIntervalRoutes(page: Page) {
  await page.route('**/api/v1/accounting/fiscal-years/current', (route) =>
    route.fulfill({ json: reportingFiscalYear })
  );
  await page.route(
    `**/api/v1/accounting/fiscal-years/${reportingFiscalYear.id}/reporting-interval`,
    (route) => route.fulfill({ json: reportingInterval })
  );
}
