import { expect, test } from '@integration/fixtures/test';
import {
  dashboardAccounts,
  registerAccountDashboardRoutes,
} from '@integration/mocks/account-dashboard';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

async function setup(page: Page) {
  await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z'));
  await registerAuthenticatedAppRoutes(page);
  const state = await registerAccountDashboardRoutes(page);

  for (const auth of ['login-with-email', 'refresh-access-token'])
    await page.route(`**/api/v1/auth/${auth}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );

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

  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');

  return state;
}

test('combines account behavior tabs and search while keeping overview queries independent', async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto('/accounts');

  await test.step('Functional and original-currency balances lead the overview', async () => {
    const overview = page.getByRole('region', {
      name: 'Overview',
      exact: true,
    });

    await expect(overview).toContainText('≈');
    await expect(overview).toContainText('₦87,450,000');
    await expect(overview).not.toContainText(/liabilit/i);
    await expect(
      overview
        .getByText('Approximate balance in functional currency')
        .locator('..')
        .locator('..')
    ).toContainText('since Apr 23, 2026');
    await expect(
      overview.getByRole('heading', { name: 'Balance growth' }).locator('..')
    ).not.toContainText('since');

    const currencies = page.getByRole('region', {
      name: 'Balances by currency',
    });

    await expect(currencies).toContainText('₦71,250,000');
    await expect(currencies).toContainText('$8,200');
    await expect(currencies).toContainText('£2,480');

    expect(
      await currencies.locator('dl').evaluate((element) => ({
        overflow: getComputedStyle(element).overflowY,
        scrolls: element.scrollHeight > element.clientHeight,
      }))
    ).toEqual({ overflow: 'auto', scrolls: true });

    await expect(
      page.getByRole('tablist', { name: 'Account type' }).getByRole('tab')
    ).toHaveText(['All', 'Bank', 'Petty Cash']);

    await page.getByText('View chart data', { exact: true }).click();
    await expect(
      page.getByRole('definition').filter({ hasText: '₦80,000,000' })
    ).toBeVisible();
    await page.getByText('View chart data', { exact: true }).click();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
      .toBe(true);
  });

  await page.setViewportSize({ width: 1280, height: 900 });
  const table = page.getByRole('region', { name: 'All accounts', exact: true });

  await expect(table.getByRole('columnheader')).toHaveText([
    'Name',
    'Type',
    'Balance',
    'Status',
  ]);
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

  const accountQueryCount = state.accountQueries.length;
  await page.getByRole('tab', { name: '1M', exact: true }).click();
  await expect
    .poll(() =>
      state.historyQueries.some(
        (query) =>
          query.get('from') === '2026-09-23' &&
          query.get('to') === '2026-10-23' &&
          query.get('bucketDays') === '5'
      )
    )
    .toBe(true);

  expect(state.accountQueries).toHaveLength(accountQueryCount);
  expect(state.summaryQueries.at(-1)?.get('type')).toBe('asset');

  await table.getByRole('button', { name: 'Account 24', exact: true }).click();
  await expect(page).toHaveURL('/accounts/account-23');
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

  await page.getByRole('button', { name: 'Add account', exact: true }).click();
  const selectionDialog = page.getByRole('dialog');
  await selectionDialog.getByRole('radio', { name: /petty cash/i }).click();
  await selectionDialog.getByRole('button', { name: /continue/i }).click();
  await expect(
    page.getByRole('heading', { name: /create petty cash account/i })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Add account', exact: true }).click();
  await selectionDialog.getByRole('radio', { name: /bank/i }).click();
  await selectionDialog.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL('/accounts/new/bank');
  await page.goto('/accounts');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Couldn’t load your accounts' })
  ).toBeVisible();

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

test('preserves available account data on section errors and recovers after refresh', async ({
  page,
}) => {
  const state = await setup(page);
  state.historyError = true;
  await page.goto('/accounts');

  await expect(page.getByRole('alert')).toContainText(
    'Couldn’t load balance history'
  );
  await expect(page.getByRole('table')).toContainText('Operating account');

  state.historyError = false;
  await page.reload();
  await expect(
    page.getByText('View chart data', { exact: true })
  ).toBeVisible();

  state.tableError = true;
  await page.getByRole('tab', { name: 'Petty Cash', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Couldn’t load the account list'
  );
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦87,450,000'
  );

  state.tableError = false;
  state.summaryError = true;
  await page.reload();
  await expect(page.getByRole('table')).toContainText('Account 2');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Couldn’t load balances' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);

  state.summaryError = false;
  await page.reload();
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦87,450,000'
  );
});

test('distinguishes no accounts, zero balances, absent behaviors and search with no matches', async ({
  page,
}) => {
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
  await selectionDialog.getByRole('radio', { name: /petty cash/i }).click();
  await selectionDialog.getByRole('button', { name: /continue/i }).click();
  await expect(
    page.getByRole('heading', { name: /create petty cash account/i })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Add first account' }).click();
  await selectionDialog.getByRole('radio', { name: /bank/i }).click();
  await selectionDialog.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL('/accounts/new/bank');

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
