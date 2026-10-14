import type {
  IRevenueExpenseAccountDto,
  IRevenueExpenseSummaryDto,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const accountsEndpoint = '**/api/v1/reporting/revenue-expense-accounts?*';
const summaryEndpoint = '**/api/v1/reporting/revenue-expense-summary?*';
const money = { amount: 800000, currencyCode: 'NGN', isMinorUnit: false };

const account: IRevenueExpenseAccountDto = {
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

const summary: IRevenueExpenseSummaryDto = {
  currencyCode: 'NGN',
  period: { from: '2026-10-01', to: '2026-10-14' },
  comparisonPeriod: { from: '2026-09-17', to: '2026-09-30' },
  revenue: {
    total: money,
    previousTotal: { ...money, amount: 0 },
    percentageChange: null,
    accounts: [
      {
        accountId: account.accountId,
        accountName: account.accountName,
        amount: money,
        sharePercentage: 100,
      },
    ],
  },
  expenses: {
    total: { ...money, amount: 500000 },
    previousTotal: { ...money, amount: 625000 },
    percentageChange: -20,
    accounts: [
      {
        accountId: 'rent',
        accountName: 'Rent',
        amount: { ...money, amount: 500000 },
        sharePercentage: 100,
      },
    ],
  },
  suspense: { amount: { ...money, amount: 5000 }, transactionCount: 2 },
};

async function setup(page: Page) {
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00Z'));
  await registerAuthenticatedAppRoutes(page);
  for (const auth of ['login-with-email', 'refresh-access-token']) {
    await page.route(`**/api/v1/auth/${auth}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  }

  await page.route(summaryEndpoint, (route) =>
    route.fulfill({ json: summary })
  );
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({
      json: {
        data: [account],
        meta: { page: 1, totalPages: 1, limit: 10, total: 1 },
      },
    })
  );
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test('opens from navigation, shows API totals, and keeps both chart sections within 400px', async ({
  page,
}, testInfo) => {
  await setup(page);

  const accounts = Array.from({ length: 18 }, (_, index) => ({
    accountId: `account-${index}`,
    accountName: `Category ${index + 1}`,
    amount: { ...money, amount: (18 - index) * 10000 },
    sharePercentage: 5,
  }));

  await page.route(summaryEndpoint, (route) =>
    route.fulfill({
      json: {
        ...summary,
        revenue: { ...summary.revenue, accounts },
        expenses: { ...summary.expenses, accounts },
      },
    })
  );
  await page.getByRole('link', { name: 'Categories', exact: true }).click();
  await expect(page).toHaveURL('/categories');
  await expect(
    page.getByRole('region', { name: 'Total revenue', exact: true })
  ).toContainText('₦800,000');
  await expect(
    page.getByRole('region', { name: 'Uncategorized', exact: true })
  ).toContainText('2 transactions');
  await expect(page.getByText('No previous-period comparison')).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Consulting services', exact: true })
  ).toBeVisible();
  await expect(page.getByText(/Current accumulated balances/)).toBeVisible();
  await expect(page.getByRole('table')).not.toContainText(account.code);
  for (const title of ['Revenue by category', 'Expenses by category']) {
    const chart = page.getByRole('region', { name: title, exact: true });
    await expect(chart.getByRole('button')).toHaveCount(18);
    expect(
      await chart.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        overflow: getComputedStyle(element).overflowY,
        scrolls: element.scrollHeight > element.clientHeight,
      }))
    ).toEqual({ height: 400, overflow: 'auto', scrolls: true });
    await chart.focus();
    await page.keyboard.press('End');
    await expect
      .poll(() => chart.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  }

  await page.getByRole('button', { name: 'Add category' }).focus();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath('categories-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('heading', { name: 'Categories', exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath('categories-mobile.png'),
    fullPage: true,
  });
});

test('filters and paginates accounts on the server while the month only changes the overview', async ({
  page,
}) => {
  await setup(page);
  const accountQueries: URLSearchParams[] = [];
  const summaryQueries: URLSearchParams[] = [];
  await page.route(accountsEndpoint, (route) => {
    const params = new URL(route.request().url()).searchParams;
    accountQueries.push(params);

    return route.fulfill({
      json: {
        data: [account],
        meta: {
          page: Number(params.get('page')),
          totalPages: 2,
          total: 11,
          limit: 10,
        },
      },
    });
  });
  await page.route(summaryEndpoint, (route) => {
    const params = new URL(route.request().url()).searchParams;
    summaryQueries.push(params);

    return route.fulfill({
      json: {
        ...summary,
        period: { from: params.get('from'), to: params.get('to') },
      },
    });
  });
  await page.goto('/categories');
  await expect(
    page.getByRole('cell', { name: 'Consulting services', exact: true })
  ).toBeVisible();
  expect(accountQueries.at(-1)?.has('type')).toBe(false);
  expect(summaryQueries.at(-1)?.get('to')).toBe('2026-10-14');
  await page.getByRole('link', { name: '2', exact: true }).click();
  await expect.poll(() => accountQueries.at(-1)?.get('page')).toBe('2');
  await page.getByRole('tab', { name: 'Expenses', exact: true }).click();
  await expect.poll(() => accountQueries.at(-1)?.get('type')).toBe('expense');
  expect(accountQueries.at(-1)?.get('page')).toBe('1');
  await page
    .getByRole('searchbox', { name: 'Search categories by name or code' })
    .fill('rent');
  await expect.poll(() => accountQueries.at(-1)?.get('search')).toBe('rent');
  const countBefore = accountQueries.length;
  await page.getByRole('combobox', { name: 'Reporting month' }).click();
  await page
    .getByRole('option', { name: 'September 2026', exact: true })
    .click();
  await expect
    .poll(() => summaryQueries.at(-1)?.get('from'))
    .toBe('2026-09-01');
  expect(summaryQueries.at(-1)?.get('to')).toBe('2026-09-30');
  expect(accountQueries.length).toBe(countBefore);
  expect(
    accountQueries.every((query) => !query.has('from') && !query.has('to'))
  ).toBe(true);
});

test('keeps loading, independent errors, retry and empty states useful', async ({
  page,
}) => {
  await setup(page);
  let releaseSummary!: () => void;

  const gate = new Promise<void>((resolve) => {
    releaseSummary = resolve;
  });

  await page.route(summaryEndpoint, async (route) => {
    await gate;
    await route.fulfill({ status: 500, json: { message: 'failure' } });
  });
  await page.goto('/categories');
  await expect(
    page.getByRole('status', { name: 'Loading category overview' })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Consulting services', exact: true })
  ).toBeVisible();
  releaseSummary();
  await expect(page.getByRole('alert')).toContainText(
    'We couldn’t load this section.'
  );
  await page.route(summaryEndpoint, (route) =>
    route.fulfill({
      json: {
        ...summary,
        revenue: { ...summary.revenue, accounts: [] },
        expenses: { ...summary.expenses, accounts: [] },
      },
    })
  );
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('No activity in this period')).toHaveCount(2);
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({ status: 500, json: { message: 'failure' } })
  );
  await page.getByRole('tab', { name: 'Revenue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('All categories');
  await expect(
    page.getByRole('region', { name: 'Total revenue', exact: true })
  ).toBeVisible();
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, totalPages: 0, total: 0, limit: 10 } },
    })
  );
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('No categories found')).toBeVisible();
});

test('creates an expense category, retaining values after a failed save', async ({
  page,
}) => {
  await setup(page);
  let saved: unknown;
  await page.route('**/api/v1/ledger/expenses', async (route) => {
    saved = route.request().postDataJSON();
    await route.fulfill({ status: 500, json: { message: 'failure' } });
  });
  await page.goto('/categories');
  await page.getByRole('button', { name: 'Add category' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Category name').fill('Office rent');
  await dialog.getByRole('combobox', { name: 'Type', exact: true }).click();
  await page.getByRole('option', { name: 'Expense', exact: true }).click();
  await dialog.getByRole('combobox', { name: 'Account behavior' }).click();
  await page
    .getByRole('option', { name: 'Rent and utilities', exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Add category' }).click();
  await expect(dialog.getByRole('alert')).toContainText(
    'We couldn’t save this category.'
  );
  await expect(dialog.getByLabel('Category name')).toHaveValue('Office rent');
  expect(saved).toEqual({
    name: 'Office rent',
    isControlAccount: false,
    behavior: 'rent_and_utilities',
  });
  await page.route('**/api/v1/ledger/expenses', (route) =>
    route.fulfill({ json: { id: 'rent' } })
  );
  await page.route(accountsEndpoint, (route) =>
    route.fulfill({
      json: {
        data: [{ ...account, accountName: 'Office rent', type: 'expense' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    })
  );
  await dialog.getByRole('button', { name: 'Add category' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Office rent', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add category' }).click();
  await expect(
    page.getByRole('dialog').getByLabel('Category name')
  ).toHaveValue('');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
});

test('renames and archives categories, then opens account-filtered transactions', async ({
  page,
}) => {
  await setup(page);
  let current = { ...account };
  let updatePayload: unknown;
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
      updatePayload = route.request().postDataJSON();
      current = { ...current, accountName: 'Advisory' };
      await route.fulfill({ json: { id: account.accountId } });
    }
  );
  await page.route(
    `**/api/v1/ledger/${account.accountId}/archive`,
    async (route) => {
      current = { ...current, status: 'archived' };
      await route.fulfill({ status: 204 });
    }
  );
  await page.goto('/categories');
  await page
    .getByRole('button', { name: 'Actions for Consulting services' })
    .click();
  await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Category name').fill('Advisory');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(updatePayload).toEqual({ name: 'Advisory' });
  await page.getByRole('button', { name: 'Actions for Advisory' }).click();
  await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Archive', exact: true })
    .click();
  await expect(page.getByRole('alertdialog')).not.toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Archived', exact: true })
  ).toBeVisible();
  const requests: URLSearchParams[] = [];
  await page.route('**/api/v1/journal-entries?*', (route) => {
    requests.push(new URL(route.request().url()).searchParams);

    return route.fulfill({
      json: { data: [], meta: { page: 1, totalPages: 0, total: 0, limit: 10 } },
    });
  });
  await page
    .getByRole('table')
    .getByRole('button', { name: 'Advisory', exact: true })
    .click();
  await expect
    .poll(() => requests.at(-1)?.get('accountId'))
    .toBe(account.accountId);
  await expect(
    page.getByText(
      'Showing transactions for the selected category, across all dates.'
    )
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show all transactions' }).click();
  await expect.poll(() => requests.at(-1)?.has('accountId')).toBe(false);
});
