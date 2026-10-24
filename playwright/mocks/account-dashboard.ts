import type {
  IBalancesBySubTypeDto,
  ILedgerAccountDto,
  ILedgerBalancesByCurrencyDto,
} from '@/shared/lib/api/Api';
import type { Page } from '@playwright/test';
import { addDays, format, parseISO } from 'date-fns';

const money = (amount: number, currencyCode = 'NGN', isMinorUnit = false) => ({
  amount,
  currencyCode,
  isMinorUnit,
});

function ledgerAccount(index: number): ILedgerAccountDto {
  return {
    id: `account-${index}`,
    code: String(10000 + index),
    materializedPath: String(10000 + index),
    accountingEntityId: 'entity',
    type: 'asset',
    normalBalance: 'debit',
    subType: 'cash_and_cash_equivalent',
    behavior: index % 2 === 0 ? 'bank' : 'petty_cash',
    isControlAccount: false,
    name: index === 0 ? 'Operating account' : `Account ${index + 1}`,
    status: index === 1 ? 'archived' : 'active',
    contraAccountRule: 'contra_not_applicable',
    adjunctAccountRule: 'adjunct_not_applicable',
    openingBalanceDate: null,
    createdBy: 'user',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    balance: money(index === 0 ? 62500000 : 100000),
    functionalBalance: money(index === 0 ? 62500000 : 100000),
  };
}

export const dashboardAccounts = Array.from({ length: 25 }, (_, index) =>
  ledgerAccount(index)
);

export async function registerAccountDashboardRoutes(page: Page) {
  const state = {
    rows: [...dashboardAccounts],
    zero: false,
    summaryError: false,
    historyError: false,
    tableError: false,
    gate: Promise.resolve(),
    accountQueries: [] as URLSearchParams[],
    historyQueries: [] as URLSearchParams[],
    summaryQueries: [] as URLSearchParams[],
  };

  await page.route('**/api/v1/ledger?*', async (route) => {
    const params = new URL(route.request().url()).searchParams;
    state.accountQueries.push(params);
    await state.gate;

    if (state.tableError)
      return route.fulfill({ status: 500, json: { message: 'Unavailable' } });

    const limit = Number(params.get('limit'));
    const currentPage = Number(params.get('page'));
    const behavior = params.get('behavior');
    const search = params.get('search')?.toLowerCase();

    const rows = state.rows
      .filter(
        (row) =>
          (!behavior || row.behavior === behavior) &&
          (!search || row.name.toLowerCase().includes(search))
      )
      .map((row) => {
        if (!state.zero) return row;

        return {
          ...row,
          balance: money(0),
          functionalBalance: money(0),
        };
      });

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
  });

  await page.route(
    '**/api/v1/reporting/ledger-balances-by-currency?*',
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      state.summaryQueries.push(params);
      await state.gate;

      if (state.summaryError)
        return route.fulfill({
          status: 500,
          json: { message: 'Unavailable' },
        });

      const amount = (value: number) => (state.zero ? 0 : value);

      const json: ILedgerBalancesByCurrencyDto = {
        totalFunctionalBalance: money(amount(87450000)),
        balancesByCurrency: [
          {
            balance: money(amount(71250000)),
            functionalBalance: money(amount(71250000)),
          },
          {
            balance: money(amount(820000), 'USD', true),
            functionalBalance: money(amount(12200000)),
          },
          {
            balance: money(amount(248000), 'GBP', true),
            functionalBalance: money(amount(4000000)),
          },
          {
            balance: money(amount(109000), 'EUR', true),
            functionalBalance: money(amount(1800000)),
          },
          {
            balance: money(amount(64000), 'CAD', true),
            functionalBalance: money(amount(750000)),
          },
          {
            balance: money(amount(82000), 'JPY'),
            functionalBalance: money(amount(1450000)),
          },
        ],
      };

      return route.fulfill({ json });
    }
  );

  await page.route(
    '**/api/v1/reporting/balances/sub-types?*',
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      state.historyQueries.push(params);
      await state.gate;

      if (state.historyError)
        return route.fulfill({
          status: 500,
          json: { message: 'Unavailable' },
        });

      const from = params.get('from')!;
      const to = params.get('to')!;
      const bucketDays = Number(params.get('bucketDays'));
      const dates: string[] = [];
      let date = parseISO(from);

      while (format(date, 'yyyy-MM-dd') < to) {
        dates.push(format(date, 'yyyy-MM-dd'));
        date = addDays(date, bucketDays);
      }

      dates.push(to);

      const json: IBalancesBySubTypeDto = {
        period: { from, to },
        buckets: dates.map((bucketDate, index) => ({
          date: bucketDate,
          balances: [
            {
              closingBalance: money(
                state.zero ? 0 : 80000000 + index * 1200000
              ),
              subType: 'cash_and_cash_equivalent',
              type: 'asset',
            },
          ],
        })),
      };

      return route.fulfill({ json });
    }
  );

  return state;
}
