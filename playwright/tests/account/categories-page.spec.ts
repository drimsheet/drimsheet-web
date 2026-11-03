import {
  EExpenseSubType,
  ERevenueSubType,
  type ILedgerAccountDto,
  type IRevenueExpenseAndSuspenseAccountBalanceDto,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

const summaryEndpoint =
  '**/api/v1/reporting/ledger/revenue-expense-and-suspense-account-balances?*';

const money = { amount: 800000, currencyCode: 'NGN', isMinorUnit: false };

const account: IRevenueExpenseAndSuspenseAccountBalanceDto = {
  accountId: '00000000-0000-4000-8000-000000000030',
  accountName: 'Consulting services',
  code: '40001',
  type: 'revenue',
  subType: 'operating_revenue',
  status: 'active',
  amount: money,
  sharePercentage: 80,
  transactionCount: 12,
};

const accountsEndpoint = '**/api/v1/ledger?*';

const ledgerAccount: ILedgerAccountDto = {
  id: account.accountId,
  name: account.accountName,
  code: account.code,
  type: 'revenue',
  subType: 'services',
  status: 'active',
  balance: { amount: 100, currencyCode: 'USD', isMinorUnit: false },
  functionalBalance: money,
  materializedPath: '40001',
  accountingEntityId: 'entity',
  normalBalance: 'credit',
  behavior: 'services',
  isControlAccount: false,
  contraAccountRule: 'contra_not_applicable',
  adjunctAccountRule: 'adjunct_not_applicable',
  openingBalanceDate: null,
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

async function setup(page: Page) {
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00Z'));
  await registerAuthenticatedAppRoutes(page);

  await page.route(summaryEndpoint, (route) =>
    route.fulfill({
      json: {
        data: [account],
        meta: { page: 1, totalPages: 1, limit: 10, total: 1 },
      },
    })
  );
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({
      json: {
        data: [ledgerAccount],
        meta: { page: 1, totalPages: 1, limit: 10, total: 1 },
      },
    })
  );
}

test('renders totals and table without reporting controls or charts', async ({
  page,
}) => {
  await setup(page);
  await page.route(summaryEndpoint, (route) => {
    const query = new URL(route.request().url()).searchParams;
    const isTotals = query.get('limit') === '100';
    const second = query.get('page') === '2';

    return route.fulfill({
      json: {
        data:
          isTotals && second
            ? [
                {
                  ...account,
                  accountId: 'expense',
                  type: 'expense',
                  amount: { ...money, amount: 500000 },
                },
                {
                  ...account,
                  accountId: 'suspense',
                  type: 'liability',
                  subType: 'suspense',
                  amount: { ...money, amount: 5000 },
                },
              ]
            : [account],
        meta: {
          page: second ? 2 : 1,
          totalPages: isTotals ? 2 : 1,
          total: isTotals ? 3 : 1,
          limit: isTotals ? 100 : 10,
        },
      },
    });
  });
  await page.goto('/categories');
  await expect(page).toHaveURL('/categories');
  await expect(
    page.getByRole('region', { name: 'Total revenue', exact: true })
  ).toContainText('₦800,000');
  await expect(
    page.getByRole('region', { name: 'Total expenses', exact: true })
  ).toContainText('₦500,000');
  await expect(
    page.getByRole('region', { name: 'Uncategorized', exact: true })
  ).toContainText('₦5,000');
  await expect(
    page.getByRole('combobox', { name: 'Reporting month' })
  ).toHaveCount(0);
  await expect(
    page.getByText('Revenue by category', { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByText('Expenses by category', { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole('cell', { name: 'Consulting services', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('tab', { name: 'All', exact: true })
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByText('Current accumulated balances.', { exact: true })
  ).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test('filters and paginates the table independently of accumulated totals', async ({
  page,
}) => {
  await setup(page);
  const queries: URLSearchParams[] = [];
  let summaryRequests = 0;
  await page.route(summaryEndpoint, (route) => {
    summaryRequests += 1;

    return route.fulfill({
      json: {
        data: [account],
        meta: { page: 1, totalPages: 1, limit: 100, total: 1 },
      },
    });
  });
  await page.route(accountsEndpoint, (route) => {
    const params = new URL(route.request().url()).searchParams;
    queries.push(params);
    let name = account.accountName;
    if (params.has('search')) {
      name = 'Rent search result';
    } else if (params.get('types[]') === 'expense') {
      name = 'Rent filtered result';
    } else if (params.get('page') === '2') {
      name = 'Second page result';
    }

    return route.fulfill({
      json: {
        data: [{ ...ledgerAccount, name }],
        meta: {
          page: Number(params.get('page')),
          totalPages: 2,
          total: 11,
          limit: 10,
        },
      },
    });
  });
  await page.goto('/categories');

  const total = page.getByRole('region', {
    name: 'Total revenue',
    exact: true,
  });

  await expect(total).toContainText('₦800,000');
  await expect(
    page.getByRole('cell', { name: 'Consulting services', exact: true })
  ).toBeVisible();
  expect(queries[0]?.getAll('types[]')).toEqual([
    'revenue',
    'expense',
    'asset',
  ]);
  expect(queries[0]?.getAll('subTypes[]')).toEqual([
    'suspense',
    ...Object.values(ERevenueSubType),
    ...Object.values(EExpenseSubType),
  ]);
  expect(queries[0]?.get('isControlAccount')).toBe('false');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Second page result', exact: true })
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Expenses', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Rent filtered result', exact: true })
  ).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search by name' }).fill('rent');
  await expect(
    page.getByRole('cell', { name: 'Rent search result', exact: true })
  ).toBeVisible();
  expect(queries.at(-1)?.get('page')).toBe('1');
  expect(queries.at(-1)?.get('types[]')).toBe('expense');
  expect(queries.at(-1)?.get('search')).toBe('rent');
  await expect(total).toContainText('₦800,000');
  expect(summaryRequests).toBe(1);
});

test('shows independent summary errors and recovers on refresh', async ({
  page,
}) => {
  await setup(page);
  let release!: () => void;

  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(summaryEndpoint, async (route) => {
    if (new URL(route.request().url()).searchParams.get('limit') === '100') {
      await gate;
      await route.fulfill({ status: 500, json: { message: 'failure' } });

      return;
    }

    await route.fulfill({
      json: {
        data: [account],
        meta: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
    });
  });
  await page.goto('/categories');
  await expect(
    page.getByRole('status', { name: 'Loading category overview' })
  ).toBeAttached();
  await expect(
    page.getByRole('cell', { name: 'Consulting services', exact: true })
  ).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toContainText(
    'We couldn’t load this section.'
  );
  await page.route(summaryEndpoint, (route) =>
    route.fulfill({
      json: {
        data: [{ ...account, amount: { ...money, amount: 0 } }],
        meta: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
    })
  );
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Total revenue', exact: true })
  ).toContainText('₦0');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, totalPages: 0, total: 0, limit: 10 } },
    })
  );
  await page.getByRole('searchbox').fill('missing');
  await expect(page.getByText('No categories found')).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Total revenue', exact: true })
  ).toContainText('₦0');
});

test('renames a category and updates the host table', async ({ page }) => {
  await setup(page);
  let current = { ...ledgerAccount };
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({
      json: {
        data: [current],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    })
  );
  await page.route(
    `**/api/v1/ledger/revenue/${account.accountId}`,
    async (route) => {
      current = { ...current, name: 'Advisory' };
      await route.fulfill({ json: { id: account.accountId } });
    }
  );
  await page.goto('/categories');
  await page
    .getByRole('button', { name: 'Actions for Consulting services' })
    .click();
  await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByLabel('Name', { exact: true })
    .fill('Advisory');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Advisory', exact: true })
  ).toBeVisible();
});
