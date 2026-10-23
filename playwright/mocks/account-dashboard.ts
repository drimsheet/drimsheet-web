import type {
  IAssetLiabilityAccountParticipationDto,
  IAssetLiabilitySummaryDto,
} from '@/shared/lib/api/Api';
import type { Page } from '@playwright/test';
import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

const money = (amount: number) => ({
  amount,
  currencyCode: 'NGN',
  isMinorUnit: false,
});

export const dashboardAccounts: IAssetLiabilityAccountParticipationDto[] =
  Array.from({ length: 25 }, (_, index) => ({
    accountId: `account-${index}`,
    accountName: index === 0 ? 'Operating' : `Account ${index + 1}`,
    code: String(10000 + index),
    type: index < 22 ? 'asset' : 'liability',
    subType: 'cash_and_cash_equivalent',
    status: index === 1 ? 'archived' : 'active',
    amount: money(index === 0 ? 5400000 : 100000),
    sharePercentage: index === 0 ? 34.44 : 1,
  }));

export async function registerAccountDashboardRoutes(page: Page) {
  const state = {
    rows: [...dashboardAccounts],
    zero: false,
    summaryError: false,
    historyError: false,
    tableError: false,
    breakdownError: false,
    gate: Promise.resolve(),
    queries: [] as URLSearchParams[],
    summaryQueries: [] as URLSearchParams[],
  };

  await page.route(
    '**/api/v1/reporting/asset-liability-account-participation?*',
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      state.queries.push(params);
      await state.gate;
      const limit = Number(params.get('limit'));
      if (
        (limit === 10 && state.tableError) ||
        (limit === 20 && state.breakdownError)
      )
        return route.fulfill({ status: 500, json: { message: 'Unavailable' } });

      const rows = state.rows
        .filter(
          (row) =>
            (!params.has('type') || row.type === params.get('type')) &&
            (!params.has('search') ||
              row.accountName
                .toLowerCase()
                .includes(params.get('search')!.toLowerCase()))
        )
        .map((row) =>
          state.zero ? { ...row, amount: money(0), sharePercentage: null } : row
        );

      const currentPage = Number(params.get('page'));

      return route.fulfill({
        json: {
          data: rows.slice((currentPage - 1) * limit, currentPage * limit),
          meta: {
            page: currentPage,
            limit,
            total: rows.length,
            totalPages: Math.ceil(rows.length / limit),
          },
        },
      });
    }
  );
  await page.route(
    '**/api/v1/reporting/asset-liability-summary?*',
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      state.summaryQueries.push(params);
      await state.gate;

      const from = params.get('from')!,
        to = params.get('to')!;

      if (
        (from === to && state.historyError) ||
        (from !== to && state.summaryError)
      )
        return route.fulfill({ status: 500, json: { message: 'Unavailable' } });

      const previousTo = subDays(parseISO(from), 1);

      const section = (amount: number, previous: number) => ({
        total: money(state.zero ? 0 : amount),
        previousTotal: money(state.zero ? 0 : previous),
        change: money(state.zero ? 0 : amount - previous),
        percentageChange: state.zero
          ? null
          : ((amount - previous) / previous) * 100,
      });

      const json: IAssetLiabilitySummaryDto = {
        currencyCode: 'NGN',
        period: { from, to },
        comparisonPeriod: {
          from: format(
            subDays(
              previousTo,
              differenceInCalendarDays(parseISO(to), parseISO(from))
            ),
            'yyyy-MM-dd'
          ),
          to: format(previousTo, 'yyyy-MM-dd'),
        },
        assets: section(15680000, 13600000),
        liabilities: section(3200000, 3200000),
        netAssets: section(from === to ? 11420000 : 12480000, 10400000),
      };

      return route.fulfill({ json });
    }
  );

  return state;
}
