import { expect, test } from '@integration/fixtures/test';
import {
  dashboardAccounts,
  registerAccountDashboardRoutes,
} from '@integration/mocks/account-dashboard';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

async function setup(page: Page) {
  await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z'));
  await registerAuthenticatedAppRoutes(page);
  const state = await registerAccountDashboardRoutes(page);

  await page.route('**/api/v1/ledger/**', (route) =>
    route.fulfill({ status: 404, json: { message: 'Not found' } })
  );

  await page.route('**/api/v1/currencies*', (route) =>
    route.fulfill({
      json: [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
      ],
    })
  );

  return state;
}

test('combines account behavior tabs and search while keeping overview queries independent', async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto('/accounts');

  const table = page.getByRole('region', { name: 'All accounts', exact: true });

  await expect(table).toContainText('1–10 of 25');
  await table.getByRole('button', { name: 'Next page' }).click();
  await expect(table).toContainText('11–20 of 25');

  await page.getByRole('tab', { name: 'Bank', exact: true }).click();
  await expect(table).toContainText('1–10 of 13');

  await page.getByRole('tab', { name: 'Petty Cash', exact: true }).click();
  await expect(table).toContainText('1–10 of 12');
  await page.getByRole('searchbox', { name: 'Search accounts' }).fill('24');
  await expect(table).toContainText('1–1 of 1');
  await expect(table).toContainText('Account 24');
  expect(Object.fromEntries(state.accountQueries.at(-1)!)).toMatchObject({
    page: '1',
    limit: '10',
    behavior: 'petty_cash',
    search: '24',
  });

  const accountQueryCount = state.accountQueries.length;
  await page.getByRole('button', { name: 'Interval', exact: true }).click();
  await page
    .getByRole('radio', { name: 'September 2026', exact: true })
    .click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .poll(() =>
      state.historyQueries.some(
        (query) =>
          query.get('from') === '2026-09-01' &&
          query.get('to') === '2026-09-30' &&
          query.get('bucketDays') === '3'
      )
    )
    .toBe(true);

  await page.getByText('View chart data', { exact: true }).click();
  await expect(
    page.getByRole('term').filter({ hasText: 'Sep 1, 2026' })
  ).toBeVisible();
  await expect(
    page.getByRole('term').filter({ hasText: 'Oct 1, 2026' })
  ).toHaveCount(0);
  await expect(table).toContainText('Account 24');

  expect(state.accountQueries).toHaveLength(accountQueryCount);
  expect(state.accountQueries.at(-1)?.getAll('types[]')).toEqual(['asset']);
  expect(state.accountQueries.at(-1)?.getAll('subTypes[]')).toEqual([
    'cash_and_cash_equivalent',
  ]);
  expect(state.accountQueries.at(-1)?.get('isControlAccount')).toBe('false');
  expect(state.summaryQueries.at(-1)?.get('type')).toBe('asset');
});

test('shows loading then a recoverable page error without invented balances', async ({
  page,
}) => {
  const state = await setup(page);
  let release!: () => void;

  state.gate = new Promise((resolve) => {
    release = resolve;
  });

  state.summaryError = true;
  state.historyError = true;
  state.tableError = true;
  await page.goto('/accounts');
  await expect(
    page.getByRole('status', { name: 'Loading account balances' })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Overview' })
  ).not.toContainText('₦87,450,000');

  release();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Couldn’t load your accounts' })
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Overview' })).toHaveCount(0);
  await expect(page.getByRole('table')).toHaveCount(0);

  state.summaryError = false;
  state.historyError = false;
  state.tableError = false;
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦87,450,000'
  );
});

for (const section of [
  { flag: 'historyError', message: 'Couldn’t load balance history' },
  { flag: 'tableError', message: 'Couldn’t load the account list' },
  { flag: 'summaryError', message: 'Couldn’t load balances' },
] as const) {
  test(`isolates ${section.flag} from the other dashboard sections`, async ({
    page,
  }) => {
    const state = await setup(page);
    state[section.flag] = true;
    await page.goto('/accounts');
    await expect(page.getByRole('alert')).toContainText(section.message);
    if (section.flag !== 'tableError') {
      await expect(page.getByRole('table')).toContainText('Operating account');
    }

    if (section.flag !== 'summaryError') {
      await expect(
        page.getByRole('region', { name: 'Overview' })
      ).toContainText('₦87,450,000');
    }

    state[section.flag] = false;
    await page.reload();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('table')).toContainText('Operating account');
    await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
      '₦87,450,000'
    );
  });
}

test('opens the account selector from the empty page', async ({ page }) => {
  const state = await setup(page);
  state.rows = [];
  await page.goto('/accounts');

  await expect(
    page.getByText('No accounts yet', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Overview' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add first account' }).click();
  const selectionDialog = page.getByRole('dialog');
  await expect(selectionDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(selectionDialog).not.toBeVisible();
});

test('keeps the zero-balance overview while filtering the account table', async ({
  page,
}) => {
  const state = await setup(page);
  state.rows = [
    {
      ...dashboardAccounts[0],
      id: 'zero',
      name: 'Zero account',
    },
  ];
  state.zero = true;
  await page.goto('/accounts');

  await expect(
    page.getByText('No balance activity yet', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦0'
  );

  await page.getByRole('tab', { name: 'Petty Cash', exact: true }).click();
  await expect(page.getByRole('table')).toContainText(
    'No petty cash accounts yet'
  );

  await page.getByRole('tab', { name: 'All', exact: true }).click();
  await page.getByRole('searchbox').fill('Mortgage');
  await expect(page.getByRole('table')).toContainText('No accounts found');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('table')).toContainText('Zero account');
});
