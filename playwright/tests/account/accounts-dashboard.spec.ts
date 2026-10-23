import { expect, test } from '@integration/fixtures/test';
import { registerAccountDashboardRoutes } from '@integration/mocks/account-dashboard';
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

test('shows real balances, 300px scrollable breakdowns, and the approved layout in both themes and mobile', async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.getByRole('link', { name: 'Accounts', exact: true }).click();
  const overview = page.getByRole('region', { name: 'Overview', exact: true });
  await expect(overview).toContainText('₦12,480,000');
  await expect(overview).toContainText('₦15,680,000');
  await expect(overview).toContainText('₦3,200,000');
  await expect(page.getByText('(20%)', { exact: true })).toBeVisible();
  const assets = page.getByRole('region', { name: 'Assets', exact: true });
  await expect(assets.getByRole('button', { name: /Operating/ })).toBeVisible();
  expect(
    await assets.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      overflow: getComputedStyle(el).overflowY,
      scrolls: el.scrollHeight > el.clientHeight,
    }))
  ).toEqual({ height: 300, overflow: 'auto', scrolls: true });
  await assets.getByRole('button', { name: 'Load more accounts' }).click();
  await expect(
    assets.getByRole('button', { name: /Account 22/ })
  ).toBeAttached();
  await expect(
    page.getByRole('columnheader', { name: 'Name', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('tablist', { name: 'Account type' }).getByRole('tab')
  ).toHaveText(['All', 'Asset', 'Liabilities']);
  await page.getByText('View chart data', { exact: true }).click();
  await expect(
    page.getByRole('definition').filter({ hasText: '₦11,420,000' })
  ).toHaveCount(5);
  await page.getByText('View chart data', { exact: true }).click();
  for (const theme of ['light', 'dark']) {
    await assets.evaluate((element) => {
      element.scrollTop = 0;
    });
    await page
      .getByRole('button', { name: 'Add account', exact: true })
      .focus();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(
      (theme) =>
        document.documentElement.classList.toggle('dark', theme === 'dark'),
      theme
    );
    await page.screenshot({
      path: testInfo.outputPath(`accounts-${theme}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('accounts-mobile.png'),
    fullPage: true,
    animations: 'disabled',
  });
});

test('combines tabs and search, resets pagination, and keeps overview queries independent', async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto('/accounts');
  const table = page.getByRole('region', { name: 'All accounts', exact: true });
  await expect(table).toContainText('1–10 of 25');
  await table.getByRole('button', { name: 'Next page' }).click();
  await expect(table).toContainText('11–20 of 25');
  await page.getByRole('tab', { name: 'Asset', exact: true }).click();
  await expect(table).toContainText('1–10 of 22');
  const before = state.queries.filter((q) => q.get('limit') === '20').length;
  await page.getByRole('tab', { name: 'Liabilities', exact: true }).click();
  await expect(table).toContainText('1–3 of 3');
  await page.getByRole('searchbox', { name: 'Search accounts' }).fill('24');
  await expect(table).toContainText('1–1 of 1');
  await expect(table).toContainText('Account 24');
  expect(state.queries.filter((q) => q.get('limit') === '20')).toHaveLength(
    before
  );
  const count = state.queries.length;
  await page.getByRole('tab', { name: '1M', exact: true }).click();
  await expect
    .poll(() =>
      state.summaryQueries.some(
        (q) => q.get('from') === '2026-09-24' && q.get('to') === '2026-10-23'
      )
    )
    .toBe(true);
  expect(state.queries).toHaveLength(count);
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
  state.tableError = true;
  state.breakdownError = true;
  await page.goto('/accounts');
  await expect(
    page.getByRole('status', { name: 'Loading account balances' })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Overview' })
  ).not.toContainText('₦12,480,000');
  release();
  await expect(page.getByRole('alert')).toContainText(
    'Couldn’t load your accounts'
  );
  state.summaryError = false;
  state.tableError = false;
  state.breakdownError = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦12,480,000'
  );
});

test('recovers history and table errors independently while preserving available balances', async ({
  page,
}) => {
  const state = await setup(page);
  state.historyError = true;
  await page.goto('/accounts');
  await expect(page.getByRole('alert')).toContainText(
    'Couldn’t load balance history'
  );
  await expect(page.getByRole('table')).toContainText('Operating');
  state.historyError = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByText('View chart data', { exact: true })
  ).toBeVisible();
  state.tableError = true;
  await page.getByRole('tab', { name: 'Liabilities', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Couldn’t load the account list'
  );
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦12,480,000'
  );
  state.tableError = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('table')).toContainText('Account 23');
});

test('distinguishes no accounts, zero balances, absent types and search with no matches', async ({
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
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  state.rows = [
    {
      accountId: 'zero',
      accountName: 'Zero account',
      code: '1000',
      type: 'asset',
      subType: 'cash_and_cash_equivalent',
      status: 'active',
      amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      sharePercentage: null,
    },
  ];
  state.zero = true;
  await page.reload();
  await expect(
    page.getByText('No balance activity yet', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Liabilities', exact: true })
  ).toContainText('No liabilities yet');
  await expect(
    page.getByRole('region', { name: 'Assets', exact: true })
  ).toContainText('—');
  await page.getByRole('tab', { name: 'Liabilities', exact: true }).click();
  await expect(page.getByRole('table')).toContainText('No liabilities yet');
  await page.getByRole('tab', { name: 'All', exact: true }).click();
  await page.getByRole('searchbox').fill('Mortgage');
  await expect(page.getByRole('table')).toContainText('No accounts found');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('table')).toContainText('Zero account');
});

test('keeps the table usable when balances or one breakdown fail', async ({
  page,
}) => {
  const state = await setup(page);
  state.summaryError = true;
  state.breakdownError = true;
  await page.goto('/accounts');
  await expect(page.getByRole('table')).toContainText('Operating');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Couldn’t load balances' })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Assets', exact: true })
  ).toContainText('Couldn’t load account shares');
  state.summaryError = false;
  await page
    .getByRole('region', { name: 'Overview' })
    .getByRole('button', { name: 'Retry' })
    .first()
    .click();
  await expect(page.getByRole('region', { name: 'Overview' })).toContainText(
    '₦12,480,000'
  );
  state.breakdownError = false;
  await page
    .getByRole('region', { name: 'Assets', exact: true })
    .getByRole('button', { name: 'Retry' })
    .click();
  await expect(
    page.getByRole('region', { name: 'Assets', exact: true })
  ).toContainText('Operating');
});
