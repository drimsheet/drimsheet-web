import type { IChartOfAccountsNodeDto } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

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
  for (const auth of ['login-with-email', 'refresh-access-token']) {
    await page.route(`**/api/v1/auth/${auth}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  }

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
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/categories');
  await page.getByRole('button', { name: 'Add category' }).click();
  await expect(page).toHaveURL('/categories/new');
}

async function chooseParent(page: Page, name: string) {
  await page
    .getByRole('button', { name: /^(Select Parent|Change parent)$/ })
    .click();
  const sheet = page.getByRole('dialog', { name: 'Select Parent' });
  await sheet.getByRole('radio', { name, exact: true }).click();
  await sheet.getByRole('button', { name: 'Use selected parent' }).click();
  await expect(sheet).not.toBeVisible();
}

test('creates an expense under a posting parent, preserving names after failure and preventing duplicate submissions', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await chooseParent(page, 'Utilities');
  await page.getByLabel(/^Name\s*Required$/).fill('Internet');
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(
    page.getByText('Enter a name for the cloned posting account.')
  ).toBeVisible();
  await page
    .getByLabel('Name for cloned posting account', { exact: false })
    .fill('General utilities');
  const preview = page.getByLabel('After creation');
  await expect(preview).toContainText('Utilities');
  await expect(preview).toContainText('General utilities');
  await expect(preview).toContainText('Internet');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Change parent' }).click();
  await expect(
    page.getByRole('radio', { name: 'Utilities', exact: true })
  ).toBeChecked();
  const sheet = page.getByRole('dialog', { name: 'Select Parent' });
  await expect(sheet.getByText('5100', { exact: true })).toHaveCount(0);
  await expect(sheet.getByText('5101', { exact: true })).toHaveCount(0);
  await expect(sheet.getByText('Parent', { exact: true })).toBeVisible();
  await expect(sheet.getByText('Child', { exact: true })).toBeVisible();
  await expect(sheet.getByText('Control', { exact: true })).toHaveCount(0);
  await expect(sheet.getByText('Posting', { exact: true })).toHaveCount(0);
  await expect(sheet.getByRole('alert')).toHaveText(
    'Selecting this child account requires a name for its cloned child account.'
  );
  await sheet
    .getByRole('radio', { name: 'Operating expenses', exact: true })
    .click();
  await expect(sheet.getByRole('alert')).toHaveCount(0);
  await sheet.getByRole('radio', { name: 'Utilities', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Change parent' })
  ).toBeFocused();
  let saved: unknown;
  await page.route('**/api/v1/ledger/expenses', async (route) => {
    saved = route.request().postDataJSON();
    await route.fulfill({ status: 400, json: { message: 'failure' } });
  });
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'We couldn’t save' })
  ).toBeVisible();
  await expect(page.getByLabel(/^Name\s*Required$/)).toHaveValue('Internet');
  await expect(
    page.getByLabel('Name for cloned posting account', { exact: false })
  ).toHaveValue('General utilities');
  expect(saved).toEqual({
    name: 'Internet',
    isControlAccount: false,
    controlAccountId: utilities.id,
    behavior: 'rent_and_utilities',
    promotionNames: {
      newControlAccountName: 'Utilities',
      newPostingAccountName: 'General utilities',
    },
  });
  let release!: () => void;

  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/api/v1/ledger/expenses', async (route) => {
    await gate;
    await route.fulfill({ json: { ...utilities, name: 'Internet' } });
  });
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Create category', exact: true })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeDisabled();
  release();
  await expect(page).toHaveURL('/categories');
  await expect(page.getByText('Category created successfully')).toBeVisible();
});

test('switches class, clears the old parent, and creates income under a control account without promotion', async ({
  page,
}) => {
  await setup(page);
  await expect(
    page.getByRole('button', { name: 'Select Parent' })
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(page.getByText('Choose a category type.')).toBeVisible();
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await chooseParent(page, 'Utilities');
  await page
    .getByLabel('Name for cloned posting account', { exact: false })
    .fill('General utilities');
  await page.getByLabel(/^Name\s*Required$/).fill('Consulting');
  await page.getByRole('radio', { name: 'Income', exact: true }).click();
  await expect(page.getByText('No parent selected')).toBeVisible();
  await expect(
    page.getByLabel('Name for cloned posting account', { exact: false })
  ).not.toBeVisible();
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(
    page.getByText('Select a parent account for this category type.')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Select Parent' }).click();
  await expect(
    page.getByRole('radio', { name: 'Services', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('radio', { name: 'Utilities', exact: true })
  ).not.toBeVisible();
  await page.getByRole('radio', { name: 'Services', exact: true }).click();
  await page.getByRole('button', { name: 'Use selected parent' }).click();
  await expect(page.getByLabel('After creation')).not.toBeVisible();
  let saved: unknown;
  await page.route('**/api/v1/ledger/revenues', async (route) => {
    saved = route.request().postDataJSON();
    await route.fulfill({ json: income });
  });
  await page
    .getByRole('button', { name: 'Create category', exact: true })
    .click();
  await expect(page).toHaveURL('/categories');
  expect(saved).toEqual({
    name: 'Consulting',
    isControlAccount: false,
    controlAccountId: income.id,
    behavior: 'services',
  });
});

test('handles chart loading, refresh recovery, empty results, expansion and cancelled selection', async ({
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
  await page.getByRole('button', { name: 'Select Parent' }).click();
  const sheet = page.getByRole('dialog', { name: 'Select Parent' });
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
  await page.route(chartEndpoint, (route) => route.fulfill({ json: [] }));
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole('radio', { name: 'Expenses', exact: true }).click();
  await page.getByRole('button', { name: 'Select Parent' }).click();
  await expect(sheet.getByText('No parent accounts available')).toBeVisible();
  await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.route(chartEndpoint, (route) =>
    route.fulfill({ json: [expenses] })
  );
  await page.getByRole('button', { name: 'Select Parent' }).click();

  const toggle = sheet.getByRole('button', {
    name: 'Expand or collapse Operating expenses',
  });

  await toggle.click();
  await expect(
    sheet.getByRole('radio', { name: 'Utilities', exact: true })
  ).not.toBeVisible();
  await toggle.click();
  await sheet.getByRole('radio', { name: 'Utilities', exact: true }).click();
  await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(sheet).not.toBeVisible();
  await expect(page.getByText('No parent selected')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page).toHaveURL('/categories');
});
