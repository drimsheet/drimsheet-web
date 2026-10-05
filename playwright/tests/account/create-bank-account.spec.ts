import type { IBankAccountCreationReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const ledgerAccountsEndpoint = '**/api/v1/ledger*';
const createBankAccountEndpoint = '**/api/v1/accounts/asset/bank';
const currenciesEndpoint = '**/api/v1/currencies*';
const banksEndpoint = '**/api/v1/banks*';

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

  await page.route(banksEndpoint, async (route) => {
    await route.fulfill({
      json: [
        { countryCode: 'NG', bankCode: 'GTB', bankName: 'Guaranty Trust Bank' },
        { countryCode: 'NG', bankCode: 'ACCESS', bankName: 'Access Bank' },
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

test.describe('Bank Account Creation Flow', () => {
  test('opens bank creation dialog, automatically loads banks for default jurisdiction, attaches statement, and submits DTO', async ({
    page,
  }) => {
    await signInAndNavigateToAccounts(page);

    let requestedBankCountry: string | null = null;
    await page.route(banksEndpoint, async (route) => {
      const url = new URL(route.request().url());
      requestedBankCountry = url.searchParams.get('countryCode');
      await route.fulfill({
        json: [
          {
            countryCode: 'NG',
            bankCode: 'GTB',
            bankName: 'Guaranty Trust Bank',
          },
          { countryCode: 'NG', bankCode: 'ACCESS', bankName: 'Access Bank' },
        ],
      });
    });

    const addAccountButton = page.getByRole('button', { name: 'Add account' });
    await expect(addAccountButton).toBeVisible();
    await addAccountButton.click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await expect(selectionDialog).toBeVisible();

    await selectionDialog.getByRole('radio', { name: /bank account/i }).click();

    const continueButton = selectionDialog.getByRole('button', {
      name: /continue/i,
    });

    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    await expect(selectionDialog).not.toBeVisible();

    const bankDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create bank account/i }),
    });

    await expect(bankDialog).toBeVisible();

    // Verify default jurisdiction NG triggered automatic bank loading without manual country reselection
    await expect.poll(() => requestedBankCountry).toBe('NG');

    // Attach local statement PDF
    const fileInput = bankDialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bank-statement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content'),
    });
    await expect(bankDialog.getByText('bank-statement.pdf')).toBeVisible();

    // Intercept POST request
    let capturedRequestBody: IBankAccountCreationReq | null = null;
    await page.route(createBankAccountEndpoint, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
        await route.fulfill({
          status: 201,
          json: { id: 'new-bank-account-id' },
        });
      } else {
        await route.fallback();
      }
    });

    // Fill form
    await bankDialog
      .getByRole('textbox', { name: 'Account display name', exact: true })
      .fill('Main Operating Account');

    // Select bank name (automatically populated for NG)
    await bankDialog.getByRole('combobox', { name: 'Bank name' }).click();
    await page.getByRole('option', { name: 'Access Bank' }).click();

    // Fill account number and account name
    await bankDialog
      .getByRole('textbox', { name: 'Bank account number' })
      .fill('0123456789');
    await bankDialog
      .getByRole('textbox', { name: 'Bank account name' })
      .fill('Acme Corp');

    // Fill opening balance
    await bankDialog
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('5000');

    // Select opening date via DateInput calendar
    await bankDialog.getByRole('button', { name: /opening date/i }).click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    // Submit form
    const createButton = bankDialog.getByRole('button', {
      name: /create account/i,
    });

    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Assert toast feedback and dialog closure
    await expect(
      page.getByText('Bank account created successfully')
    ).toBeVisible();
    await expect(bankDialog).not.toBeVisible();

    // Assert JSON POST body contains no statement file and correct structure
    expect(capturedRequestBody).toEqual({
      name: 'Main Operating Account',
      currencyCode: 'NGN',
      bankAccount: {
        bankName: 'Access Bank',
        accountName: 'Acme Corp',
        accountNumber: '0123456789',
      },
      openingBalance: {
        amount: {
          amount: 5000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: expect.stringMatching(/^\d{4}-\d{2}-15$/),
        exchangeRate: null,
      },
    });
  });

  test('retains form fields and uploaded statement file on API creation failure', async ({
    page,
  }) => {
    await signInAndNavigateToAccounts(page);

    await page.route(createBankAccountEndpoint, async (route) => {
      await route.fulfill({
        status: 500,
        json: { message: 'Failed to create bank account' },
      });
    });

    await page.getByRole('button', { name: 'Add account' }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await selectionDialog.getByRole('radio', { name: /bank account/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const bankDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create bank account/i }),
    });

    // Attach statement
    const fileInput = bankDialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'retained-statement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content'),
    });
    await expect(bankDialog.getByText('retained-statement.pdf')).toBeVisible();

    // Fill form
    await bankDialog
      .getByRole('textbox', { name: 'Account display name', exact: true })
      .fill('Retained Form Account');
    await bankDialog.getByRole('combobox', { name: 'Bank name' }).click();
    await page.getByRole('option', { name: 'Access Bank' }).click();
    await bankDialog
      .getByRole('textbox', { name: 'Bank account number' })
      .fill('9998887776');
    await bankDialog
      .getByRole('textbox', { name: 'Bank account name' })
      .fill('Retained Corp');
    await bankDialog
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('1200');
    await bankDialog.getByRole('button', { name: /opening date/i }).click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    await bankDialog.getByRole('button', { name: /create account/i }).click();

    // Dialog stays open, values and statement file are retained
    await expect(bankDialog).toBeVisible();
    await expect(bankDialog.getByText('retained-statement.pdf')).toBeVisible();
    await expect(
      bankDialog.getByRole('textbox', {
        name: 'Account display name',
        exact: true,
      })
    ).toHaveValue('Retained Form Account');
    await expect(
      bankDialog.getByRole('textbox', { name: 'Bank account number' })
    ).toHaveValue('9998887776');
  });

  test('resets form and statement state after dismissal and reopening', async ({
    page,
  }) => {
    await signInAndNavigateToAccounts(page);

    await page.getByRole('button', { name: 'Add account' }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select account type/i }),
    });

    await selectionDialog.getByRole('radio', { name: /bank account/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const bankDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create bank account/i }),
    });

    // Fill form and attach file
    await bankDialog
      .getByRole('textbox', { name: 'Account display name', exact: true })
      .fill('Draft Account');
    const fileInput = bankDialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'draft-statement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('draft content'),
    });
    await expect(bankDialog.getByText('draft-statement.pdf')).toBeVisible();

    // Dismiss via Escape
    await page.keyboard.press('Escape');
    await expect(bankDialog).not.toBeVisible();

    // Reopen dialog
    await page.getByRole('button', { name: 'Add account' }).click();
    await selectionDialog.getByRole('radio', { name: /bank account/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    // Verify reopened form and statement upload are clean
    await expect(bankDialog).toBeVisible();
    await expect(
      bankDialog.getByRole('textbox', {
        name: 'Account display name',
        exact: true,
      })
    ).toHaveValue('');
    await expect(bankDialog.getByText('draft-statement.pdf')).not.toBeVisible();
  });
});
