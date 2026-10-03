import accountingLocale from '@/accounting/i18n/locales/en/accounting.json' with { type: 'json' };
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import {
  catalog,
  entity,
  registerOnboardingRoutes,
} from '@integration/mocks/onboarding';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const entityListEndpoint = '**/api/v1/accounting/accounting-entities';
const entityCreationEndpoint = '**/api/v1/accounting/accounting-entity';

async function signIn(page: Page) {
  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });
  await page.route('**/api/v1/auth/refresh-access-token', async (route) => {
    await route.fulfill({ json: { accessToken: 'integration-test-token' } });
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

async function registerConfigurationRoutes(page: Page) {
  await page.route('**/api/v1/currencies', async (route) => {
    await route.fulfill({
      json: [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
        { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
      ],
    });
  });
  await page.route('**/api/v1/accounting/jurisdictions', async (route) => {
    await route.fulfill({
      json: [
        {
          code: 'NG',
          name: 'Nigeria',
          currencyCode: 'NGN',
          accountingStandards: {
            individual: ['IFRS'],
            sole_trader: ['IFRS'],
            private_company: ['IFRS'],
          },
        },
      ],
    });
  });
}

async function completeAccountingEntityForm(
  page: Page,
  manual = false,
  reportingCurrency?: string
) {
  const dialog = page.getByRole('dialog', { name: 'Account setup' });
  await dialog
    .getByRole('combobox', { name: 'Who is this account for?' })
    .click();
  await page.getByRole('option', { name: 'A Company' }).click();
  await dialog.getByRole('textbox', { name: 'Name' }).fill('Drimsheet');
  await dialog.getByRole('button', { name: 'Next' }).click();
  await expect(
    dialog.getByText('What currency should your reports use?')
  ).toBeVisible();
  if (reportingCurrency) {
    await dialog
      .getByRole('combobox', { name: 'What currency should your reports use?' })
      .fill(reportingCurrency);
    await page
      .getByRole('option', { name: new RegExp(reportingCurrency) })
      .click();
  }
  await dialog.getByRole('button', { name: 'Next' }).click();
  if (manual) await dialog.getByRole('radio', { name: /Manual/ }).check();
  await dialog.getByRole('button', { name: 'Complete setup' }).click();
}

test('does not show onboarding when the entity query returns an entity', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await signIn(page);

  await expect(
    page.getByRole('dialog', { name: 'Account setup' })
  ).not.toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
});

test('shows a non-dismissible onboarding dialog for an empty entity result', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route(entityListEndpoint, async (route) => {
    await route.fulfill({ json: [] });
  });
  await registerConfigurationRoutes(page);

  await signIn(page);

  const dialog = page.getByRole('dialog', { name: 'Account setup' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('combobox', { name: 'Who is this account for?' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: /close/i })).toHaveCount(0);
});

test('creates headers and all posting accounts sequentially before closing onboarding', async ({
  page,
}) => {
  let release!: () => void;
  const lastAccount = new Promise<void>((resolve) => {
    release = resolve;
  });
  await registerAuthenticatedAppRoutes(page);
  const state = await registerOnboardingRoutes(page, {
    beforePosting: async (index) => {
      if (index === 17) await lastAccount;
    },
  });
  await registerConfigurationRoutes(page);
  await signIn(page);
  await completeAccountingEntityForm(page, false, 'US Dollar');
  const dialog = page.getByRole('dialog', { name: 'Account setup' });
  await expect
    .poll(
      () =>
        state.calls.filter((call) => call.path === '/accounts/suspense').length
    )
    .toBe(2);
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Complete setup' })
  ).toBeDisabled();
  await expect(page.getByText('Welcome to Drimsheet!')).not.toBeVisible();
  release();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Welcome to Drimsheet!')).toBeVisible();
  const calls = state.calls.filter((call) => call.method === 'POST');
  expect(calls.map((call) => call.path)).toEqual([
    '/accounting/accounting-entity',
    '/ledger/header-accounts/setup',
    '/accounts/asset/receivables/statutory',
    '/accounts/liability/payables/statutory',
    ...Array(6).fill('/accounts/revenues'),
    ...Array(8).fill('/accounts/expenses'),
    '/accounts/suspense',
    '/accounts/suspense',
  ]);
  expect(calls[0].body).toEqual(
    expect.objectContaining({
      name: 'Drimsheet',
      entityType: 'private_company',
      functionalCurrencyCode: 'NGN',
      reportingCurrencyCode: 'USD',
      appPreferences: { appUsageMode: 'non_power_user' },
    })
  );
  expect(calls[1].body).toEqual(
    expect.objectContaining({
      cash_and_cash_equivalent:
        accountingLocale.header_cash_and_cash_equivalent_name,
      services: accountingLocale.header_services_name,
      statutory_payables: accountingLocale.header_statutory_payables_name,
    })
  );
  for (const call of calls.slice(2)) {
    expect(call.body).not.toHaveProperty('controlAccountId');
    expect(call.body).not.toHaveProperty('controlAccountCode');
  }
  expect(calls[2].body).toEqual({
    name: catalog.receivables[0].name,
    isControlAccount: false,
    currencyCode: 'NGN',
  });
  expect(calls[3].body).toEqual({
    name: catalog.payables[0].name,
    isControlAccount: false,
    currencyCode: 'NGN',
    meta: null,
  });
  expect(calls[4].body).toEqual({
    name: catalog.revenue[0].name,
    isControlAccount: false,
    behavior: 'services',
  });
  expect(calls[10].body).toEqual({
    name: catalog.expense[0].name,
    isControlAccount: false,
    behavior: 'default_direct_cost',
  });
  expect(calls[18].body).toEqual({
    name: accountingLocale.bootstrap_asset_suspense_account_name,
    type: 'asset',
    currencyCode: 'NGN',
  });
  expect(calls.slice(1).every((call) => call.entityId === entity.id)).toBe(
    true
  );
});

test('handles an entity creation API error without crashing onboarding', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await registerOnboardingRoutes(page);
  await page.route(entityListEndpoint, async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route(entityCreationEndpoint, async (route) => {
    await route.fulfill({
      status: 400,
      json: {
        name: 'AccountingError',
        errorKey: 'accounting_error_accounting_entity_type_invalid',
        validationErrors: [],
      },
    });
  });
  await registerConfigurationRoutes(page);
  await signIn(page);

  await completeAccountingEntityForm(page);

  await expect(page.getByText('Invalid accounting entity type.')).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Account setup' })
  ).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
  const dialog = page.getByRole('dialog', { name: 'Account setup' });
  await dialog.getByRole('button', { name: 'Back' }).click();
  await dialog.getByRole('button', { name: 'Back' }).click();
  await expect(dialog.getByRole('textbox', { name: 'Name' })).toHaveValue(
    'Drimsheet'
  );
});

test('stops after a header setup failure and releases the loader', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  const state = await registerOnboardingRoutes(page, { failHeader: true });
  await registerConfigurationRoutes(page);
  await signIn(page);
  await completeAccountingEntityForm(page);
  await expect(page.getByText('Invalid accounting entity type.')).toBeVisible();
  const dialog = page.getByRole('dialog', { name: 'Account setup' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Complete setup' })
  ).toBeEnabled();
  expect(state.createdAccounts).toHaveLength(0);
  expect(
    state.calls.filter((call) => call.path === '/ledger/header-accounts/setup')
  ).toHaveLength(1);
});

test('stops at a failed posting request without issuing subsequent writes', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  const state = await registerOnboardingRoutes(page, { failPostingIndex: 4 });
  await registerConfigurationRoutes(page);
  await signIn(page);
  await completeAccountingEntityForm(page);
  await expect(page.getByText('Invalid accounting entity type.')).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Account setup' })
  ).toBeVisible();
  expect(state.createdAccounts).toHaveLength(4);
  expect(
    state.calls.filter(
      (call) => call.method === 'POST' && call.path.startsWith('/accounts/')
    )
  ).toHaveLength(5);
});

test('does not welcome the user when the completion refresh fails', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  const state = await registerOnboardingRoutes(page, { failRefresh: true });
  await registerConfigurationRoutes(page);
  await signIn(page);
  await completeAccountingEntityForm(page);
  await expect(page.getByText('Invalid accounting entity type.')).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Account setup' })
  ).toBeVisible();
  await expect(
    page
      .getByRole('dialog', { name: 'Account setup' })
      .getByRole('button', { name: 'Complete setup' })
  ).toBeEnabled();
  await expect(page.getByText('Welcome to Drimsheet!')).not.toBeVisible();
  expect(state.createdAccounts).toHaveLength(18);
});

test('retains the unchanged Manual path without any bootstrap calls', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  const state = await registerOnboardingRoutes(page);
  await registerConfigurationRoutes(page);
  await signIn(page);
  await completeAccountingEntityForm(page, true);
  await expect(
    page.getByRole('dialog', { name: 'Account setup' })
  ).not.toBeVisible();
  expect(
    state.calls.filter(
      (call) =>
        call.path.startsWith('/accounts/') || call.path.startsWith('/ledger')
    )
  ).toHaveLength(0);
});

for (const invalidField of ['key', 'behavior'] as const) {
  test(`rejects an unsupported recommendation ${invalidField} before creating the entity`, async ({
    page,
  }) => {
    await registerAuthenticatedAppRoutes(page);
    const state = await registerOnboardingRoutes(page);
    await page.route(
      '**/api/v1/accounts/recommended-bootstrap',
      async (route) => {
        await route.fulfill({
          json: {
            ...catalog,
            revenue: catalog.revenue.map((account, index) =>
              index === 0
                ? { ...account, [invalidField]: 'unsupported' }
                : account
            ),
          },
        });
      }
    );
    await registerConfigurationRoutes(page);
    await signIn(page);
    await completeAccountingEntityForm(page);
    await expect(
      page.getByText(accountingLocale.onboarding_invalid_catalog_error)
    ).toBeVisible();
    const dialog = page.getByRole('dialog', { name: 'Account setup' });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Complete setup' })
    ).toBeEnabled();
    expect(state.calls.filter((call) => call.method === 'POST')).toHaveLength(
      0
    );
  });
}
