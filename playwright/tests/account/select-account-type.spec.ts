import type { IPettyCashAccountCreationReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import { registerAccountDashboardRoutes } from '@integration/mocks/account-dashboard';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const ledgerAccountsEndpoint = '**/api/v1/ledger*';
const createPettyCashEndpoint = '**/api/v1/ledger/asset/petty-cash';
const currenciesEndpoint = '**/api/v1/currencies';
const exchangeRatesEndpoint = '**/api/v1/currencies/exchange-rates*';

async function registerAccountPageRoutes(page: Page) {
  await registerAuthenticatedAppRoutes(page);
  await registerAccountDashboardRoutes(page);

  await page.route(refreshEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.route(currenciesEndpoint, async (route) => {
    await route.fulfill({
      json: [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
        { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
      ],
    });
  });

  await page.route(exchangeRatesEndpoint, async (route) => {
    const url = new URL(route.request().url());
    const currencyPair = url.searchParams.get('currencyPair') ?? '';

    const [baseCurrencyCode = '', targetCurrencyCode = ''] =
      currencyPair.split('/');

    const asOf = url.searchParams.get('asOf') ?? '';

    await route.fulfill({
      json: [
        {
          currencyPair,
          baseCurrencyCode,
          targetCurrencyCode,
          rate: 1500,
          type: 'official',
          asOf: `${asOf}T00:00:00.000Z`,
          source: 'central-bank',
          createdAt: `${asOf}T01:00:00.000Z`,
        },
      ],
    });
  });

  await page.route(ledgerAccountsEndpoint, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        json: {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      });
    } else {
      await route.fallback();
    }
  });
}

async function signInAndNavigateToAccounts(page: Page) {
  await registerAccountPageRoutes(page);

  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');

  await page.getByRole('link', { name: 'Accounts', exact: true }).click();
  await expect(page).toHaveURL('/accounts');
}

test.describe('Account Type Selection Flow', () => {
  test('creates foreign-currency petty cash through the selector after a settled failure', async ({
    page,
  }) => {
    await signInAndNavigateToAccounts(page);

    await page.getByRole('button', { name: 'Add account' }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await selectionDialog.getByRole('radio', { name: /petty cash/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const pettyCashDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create petty cash account/i }),
    });

    await expect(pettyCashDialog).toBeVisible();

    let attempts = 0;
    let capturedRequestBody: IPettyCashAccountCreationReq | null = null;
    await page.route(createPettyCashEndpoint, async (route) => {
      capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
      expect(route.request().method()).toBe('POST');
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({ status: 500, json: { name: 'UnexpectedError' } });

        return;
      }

      await route.fulfill({
        status: 201,
        json: { id: 'foreign-petty-cash-account' },
      });
    });

    await pettyCashDialog
      .getByRole('textbox', { name: 'Account Display Name' })
      .fill('Travel Cash');
    await pettyCashDialog.getByRole('combobox', { name: 'Currency' }).click();
    await page.getByRole('option', { name: /US Dollar/i }).click();
    await pettyCashDialog
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('100');

    const exchangeRateRequestPromise = page.waitForRequest((request) =>
      request.url().includes('/api/v1/currencies/exchange-rates')
    );

    await pettyCashDialog
      .getByRole('button', { name: /opening date/i })
      .click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    const exchangeRateRequest = await exchangeRateRequestPromise;
    const exchangeRateUrl = new URL(exchangeRateRequest.url());
    expect(exchangeRateUrl.searchParams.get('currencyPair')).toBe('USD/NGN');
    expect(exchangeRateUrl.searchParams.get('type')).toBe('official');
    expect(exchangeRateUrl.searchParams.get('limit')).toBe('1');
    expect(exchangeRateUrl.searchParams.get('asOf')).toMatch(
      /^\d{4}-\d{2}-15$/
    );

    await expect(
      pettyCashDialog.getByText('Official rate: 1500')
    ).toBeVisible();
    await expect(
      pettyCashDialog.getByRole('textbox', { name: 'Exchange rate' })
    ).toHaveValue('1,500');

    await pettyCashDialog
      .getByRole('button', { name: /create account/i })
      .click();

    await test.step('Failed creation preserves the foreign-currency draft', async () => {
      await expect(
        page.getByText('An error occurred', { exact: true })
      ).toBeVisible();

      const submit = pettyCashDialog.getByRole('button', {
        name: /create account/i,
      });

      await expect(submit).toBeEnabled();
      await expect(
        pettyCashDialog.getByRole('textbox', { name: 'Account Display Name' })
      ).toHaveValue('Travel Cash');
      await expect(
        pettyCashDialog.getByRole('textbox', { name: 'Opening balance' })
      ).toHaveValue('100');
      await expect(
        pettyCashDialog.getByRole('textbox', { name: 'Exchange rate' })
      ).toHaveValue('1,500');
      await submit.click();
    });
    await expect(
      page.getByText('Petty cash account created successfully')
    ).toBeVisible();
    expect(capturedRequestBody).toMatchObject({
      name: 'Travel Cash',
      currencyCode: 'USD',
      openingBalance: {
        amount: {
          amount: 100,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        date: expect.stringMatching(/^\d{4}-\d{2}-15$/),
        exchangeRate: {
          baseCurrencyCode: 'USD',
          targetCurrencyCode: 'NGN',
          rate: 1500,
          type: 'market',
          source: 'manual',
        },
      },
    });
    await expect(pettyCashDialog).not.toBeVisible();
    expect(attempts).toBe(2);
  });
});
