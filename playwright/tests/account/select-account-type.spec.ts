import type { IPettyCashAccountCreationReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
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

  await page.goto('/accounts');
  await expect(page).toHaveURL('/accounts');
}

test.describe('Account Type Selection Flow', () => {
  test('opens account type selector and completes petty cash creation happy path', async ({
    page,
  }) => {
    await signInAndNavigateToAccounts(page);

    const addAccountButton = page.getByRole('button', { name: 'Add account' });
    await expect(addAccountButton).toBeVisible();
    await addAccountButton.click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await expect(selectionDialog).toBeVisible();

    // Select Petty cash
    await selectionDialog.getByRole('radio', { name: /petty cash/i }).click();

    const continueButton = selectionDialog.getByRole('button', {
      name: /continue/i,
    });

    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    await expect(selectionDialog).not.toBeVisible();

    const pettyCashDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create petty cash account/i }),
    });

    await expect(pettyCashDialog).toBeVisible();

    // Intercept POST creation request and verify payload
    let capturedRequestBody: IPettyCashAccountCreationReq | null = null;
    await page.route(createPettyCashEndpoint, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
        await route.fulfill({
          status: 201,
          json: { id: 'new-petty-cash-account' },
        });
      } else {
        await route.fallback();
      }
    });

    // Fill form fields
    await pettyCashDialog
      .getByRole('textbox', { name: 'Account Display Name' })
      .fill('Main Office Cash');
    await pettyCashDialog
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('500');

    // Select opening date via DateInput calendar popover
    await pettyCashDialog
      .getByRole('button', { name: /opening date/i })
      .click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    // Submit form
    const createButton = pettyCashDialog.getByRole('button', {
      name: /create account/i,
    });

    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Assert success feedback toast and dialog closure
    await expect(
      page.getByText('Petty cash account created successfully')
    ).toBeVisible();
    await expect(pettyCashDialog).not.toBeVisible();

    // Assert request payload sent to backend
    expect(capturedRequestBody).toMatchObject({
      name: 'Main Office Cash',
      currencyCode: 'NGN',
      isControlAccount: false,
      openingBalance: {
        amount: {
          amount: 500,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: expect.stringMatching(/^\d{4}-\d{2}-15$/),
        exchangeRate: null,
      },
    });
  });

  test('uses an official rate when creating a foreign-currency petty cash account', async ({
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

    let capturedRequestBody: IPettyCashAccountCreationReq | null = null;
    await page.route(createPettyCashEndpoint, async (route) => {
      capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
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
  });

  test('allows selecting all visible account types', async ({ page }) => {
    await signInAndNavigateToAccounts(page);

    await page.getByRole('button', { name: 'Add account' }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await expect(selectionDialog).toBeVisible();

    const bankRadio = selectionDialog.getByRole('radio', {
      name: /bank account/i,
    });

    const pettyCashRadio = selectionDialog.getByRole('radio', {
      name: /petty cash/i,
    });

    const virtualAccountRadio = selectionDialog.getByRole('radio', {
      name: /virtual account/i,
    });

    const creditCardRadio = selectionDialog.getByRole('radio', {
      name: /credit card/i,
    });

    await expect(bankRadio).toBeEnabled();
    await expect(pettyCashRadio).toBeEnabled();
    await expect(virtualAccountRadio).toBeEnabled();
    await expect(creditCardRadio).toBeEnabled();

    await expect(selectionDialog.getByText('Coming soon')).toHaveCount(0);

    const continueButton = selectionDialog.getByRole('button', {
      name: /continue/i,
    });

    await expect(continueButton).toBeDisabled();

    await virtualAccountRadio.click();
    await expect(continueButton).toBeEnabled();

    await pettyCashRadio.click();
    await expect(continueButton).toBeEnabled();
  });

  test('rejects negative opening balance for petty cash with localized error', async ({
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

    await pettyCashDialog
      .getByRole('textbox', { name: 'Account Display Name' })
      .fill('Petty Cash Fund');
    await pettyCashDialog
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('-100');
    await pettyCashDialog
      .getByRole('button', { name: /opening date/i })
      .click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    await pettyCashDialog
      .getByRole('button', { name: /create account/i })
      .click();

    await expect(
      pettyCashDialog.getByText('Opening balance cannot be negative')
    ).toBeVisible();
    await expect(pettyCashDialog).toBeVisible();
  });

  test('retains petty cash form state on API failure', async ({ page }) => {
    await signInAndNavigateToAccounts(page);

    await page.route(createPettyCashEndpoint, async (route) => {
      await route.fulfill({
        status: 500,
        json: { message: 'Internal Server Error' },
      });
    });

    await page.getByRole('button', { name: 'Add account' }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await selectionDialog.getByRole('radio', { name: /petty cash/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const pettyCashDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create petty cash account/i }),
    });

    await pettyCashDialog
      .getByRole('textbox', { name: 'Account Display Name' })
      .fill('Failed Attempt Cash');
    await pettyCashDialog
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('250');
    await pettyCashDialog
      .getByRole('button', { name: /opening date/i })
      .click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    await pettyCashDialog
      .getByRole('button', { name: /create account/i })
      .click();

    await expect(pettyCashDialog).toBeVisible();
    await expect(
      pettyCashDialog.getByRole('textbox', { name: 'Account Display Name' })
    ).toHaveValue('Failed Attempt Cash');
    await expect(
      pettyCashDialog.getByRole('textbox', { name: 'Opening balance' })
    ).toHaveValue('250');
  });
});
