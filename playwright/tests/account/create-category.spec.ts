import type { IChartOfAccountsNodeDto } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

const chartEndpoint = '**/api/v1/ledger/chart-of-accounts?*';
const timestamp = '2026-10-15T00:00:00Z';
const money = { amount: 0, currencyCode: 'NGN', isMinorUnit: false };

const utilities: IChartOfAccountsNodeDto = {
  id: '00000000-0000-4000-8000-000000000041' as IChartOfAccountsNodeDto['id'],
  name: 'Utilities',
  code: '5101',
  type: 'expense',
  subType: 'rent_and_utilities',
  behavior: 'rent_and_utilities',
  isControlAccount: false,
  materializedPath: '5100.5101',
  accountingEntityId:
    '00000000-0000-4000-8000-000000000002' as IChartOfAccountsNodeDto['id'],
  normalBalance: 'debit',
  status: 'active',
  contraAccountRule: 'contra_not_applicable',
  adjunctAccountRule: 'adjunct_not_applicable',
  openingBalanceDate: null,
  createdBy: authenticatedUser.id,
  createdAt: timestamp,
  updatedAt: timestamp,
  balance: money,
  functionalBalance: money,
  children: [],
};

const expenses: IChartOfAccountsNodeDto = {
  ...utilities,
  id: '00000000-0000-4000-8000-000000000040' as IChartOfAccountsNodeDto['id'],
  name: 'Operating expenses',
  code: '5100',
  materializedPath: '5100',
  isControlAccount: true,
  children: [utilities],
};

const income: IChartOfAccountsNodeDto = {
  ...expenses,
  id: '00000000-0000-4000-8000-000000000050' as IChartOfAccountsNodeDto['id'],
  name: 'Services',
  type: 'revenue',
  subType: 'services',
  behavior: 'services',
  normalBalance: 'credit',
  children: [],
};

async function setup(page: Page) {
  await registerAuthenticatedAppRoutes(page);

  await page.route(
    '**/api/v1/reporting/ledger/revenue-expense-and-suspense-account-balances?*',
    (route) =>
      route.fulfill({
        json: {
          data: [],
          meta: { page: 1, totalPages: 0, total: 0, limit: 10 },
        },
      })
  );

  await page.route('**/api/v1/ledger?*', (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, totalPages: 0, total: 0, limit: 10 } },
    })
  );

  const section = {
    total: money,
    previousTotal: money,
    percentageChange: null,
    accounts: [],
  };

  await page.route(
    '**/api/v1/reporting/ledger/revenue-and-expense-activity-summary?*',
    (route) =>
      route.fulfill({
        json: {
          currencyCode: 'NGN',
          period: { from: '2026-10-01', to: '2026-10-15' },
          comparisonPeriod: { from: '2026-09-16', to: '2026-09-30' },
          revenue: section,
          expenses: section,
          suspense: { amount: money, transactionCount: 0 },
        },
      })
  );
  await page.route(chartEndpoint, (route) =>
    route.fulfill({
      json:
        new URL(route.request().url()).searchParams.get('class') === 'revenue'
          ? [income]
          : [expenses],
    })
  );
  await page.goto('/categories/new');
}

async function chooseParent(page: Page, name: string) {
  await page
    .getByRole('button', { name: /^(Select parent account|Change parent)$/ })
    .click();
  const sheet = page.getByRole('dialog', { name: 'Select parent account' });
  if (name === 'Utilities') {
    await sheet
      .getByRole('button', { name: 'Expand or collapse Operating expenses' })
      .click();
  }

  await sheet.getByRole('radio', { name, exact: true }).click();
  await sheet.getByRole('button', { name: 'Use selected parent' }).click();
  await expect(sheet).not.toBeVisible();
}

test('coordinates the selected parent and preview and retains names after a failed save', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await chooseParent(page, 'Utilities');
  await page.getByLabel('Category name', { exact: true }).fill('Internet');
  await page
    .getByLabel('Name for cloned posting account', { exact: false })
    .fill('General utilities');
  const preview = page.getByLabel('After creation');
  await expect(preview).toContainText('Utilities');
  await expect(preview).toContainText('General utilities');
  await expect(preview).toContainText('Internet');
  await page.route('**/api/v1/ledger/expenses', async (route) => {
    await route.fulfill({ status: 400, json: { message: 'failure' } });
  });
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'We couldn’t save' })
  ).toBeVisible();
  await expect(page.getByLabel('Category name', { exact: true })).toHaveValue(
    'Internet'
  );
  await expect(
    page.getByLabel('Name for cloned posting account', { exact: false })
  ).toHaveValue('General utilities');
});

test('clears the previous parent and preview when the category class changes', async ({
  page,
}) => {
  await setup(page);
  await expect(
    page.getByRole('button', { name: 'Select parent account' })
  ).toBeDisabled();
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await chooseParent(page, 'Utilities');
  await page
    .getByLabel('Name for cloned posting account', { exact: false })
    .fill('General utilities');
  await page.getByLabel('Category name', { exact: true }).fill('Consulting');
  await page.getByRole('radio', { name: 'Income', exact: true }).click();
  await expect(page.getByText('No parent selected')).toBeVisible();
  await expect(
    page.getByLabel('Name for cloned posting account', { exact: false })
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Select parent account' }).click();
  await expect(
    page.getByRole('radio', { name: 'Services', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('radio', { name: 'Utilities', exact: true })
  ).not.toBeVisible();
  await page.getByRole('radio', { name: 'Services', exact: true }).click();
  await page.getByRole('button', { name: 'Use selected parent' }).click();
  await expect(page.getByLabel('After creation')).not.toBeVisible();
});

test('shows parent-picker loading and errors, then recovers after refresh', async ({
  page,
}) => {
  await setup(page);
  let release!: () => void;

  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(chartEndpoint, async (route) => {
    await gate;
    await route.fulfill({ status: 500, json: { message: 'failure' } });
  });
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await page.getByRole('button', { name: 'Select parent account' }).click();
  const sheet = page.getByRole('dialog', { name: 'Select parent account' });
  await expect(
    sheet.getByRole('status', { name: 'Loading chart of accounts' })
  ).toBeVisible();
  await expect(
    sheet.getByRole('button', { name: 'Use selected parent' })
  ).toBeDisabled();
  release();
  await expect(sheet.getByRole('alert')).toContainText(
    'We couldn’t load the chart of accounts.'
  );
  await page.route(chartEndpoint, (route) =>
    route.fulfill({ json: [expenses] })
  );
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await page.getByRole('button', { name: 'Select parent account' }).click();
  await expect(
    sheet.getByRole('radio', { name: 'Operating expenses', exact: true })
  ).toBeVisible();
});
