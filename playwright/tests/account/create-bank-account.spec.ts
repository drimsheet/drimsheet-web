import type { IBankAccountCreationReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import { registerAccountDashboardRoutes } from '@integration/mocks/account-dashboard';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const createBankAccountEndpoint = '**/api/v1/ledger/asset/bank';
const currenciesEndpoint = '**/api/v1/currencies*';
const banksEndpoint = '**/api/v1/banks*';

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

  await page.route(banksEndpoint, async (route) => {
    await route.fulfill({
      json: [
        { countryCode: 'NG', bankCode: 'GTB', bankName: 'Guaranty Trust Bank' },
        { countryCode: 'NG', bankCode: 'ACCESS', bankName: 'Access Bank' },
      ],
    });
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

test.describe('Bank Account Creation Flow', () => {
  test('creates a bank account after draft cancellation and a failed save, retaining the statement', async ({
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

    const bankPage = page.getByRole('main');

    await expect(page).toHaveURL('/accounts/new/bank');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      bankPage.getByRole('navigation', { name: /breadcrumb/i })
    ).toHaveCount(0);
    await expect(
      bankPage.getByRole('heading', { name: 'Create bank account', level: 1 })
    ).toBeVisible();

    await expect(bankPage).toBeVisible();
    await expect(
      bankPage.getByRole('heading', {
        name: 'Account details',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      bankPage.getByRole('heading', { name: 'Bank account details' })
    ).toBeVisible();
    await expect(bankPage.getByLabel('Create as a sub account')).toHaveCount(0);

    await test.step('The page uses equal desktop columns and prioritizes upload on mobile', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });

      const statement = bankPage.getByRole('region', {
        name: 'Create automatically from a bank statement',
        exact: true,
      });

      const account = bankPage.getByRole('region', {
        name: 'Account details',
        exact: true,
      });

      await expect(
        statement.getByText('PDFs only', { exact: true })
      ).toHaveCount(1);
      await expect
        .poll(async () => {
          const uploadBox = await statement.boundingBox();
          const formBox = await account.boundingBox();

          const firstControlBox = await account
            .getByRole('textbox', {
              name: 'Account display name',
              exact: true,
            })
            .boundingBox();

          return Boolean(
            uploadBox &&
            formBox &&
            firstControlBox &&
            Math.abs(uploadBox.width - formBox.width) < 1 &&
            uploadBox.x > formBox.x &&
            Math.abs(uploadBox.y - firstControlBox.y) < 1
          );
        })
        .toBe(true);

      await page.setViewportSize({ width: 390, height: 844 });
      await expect
        .poll(async () => {
          const uploadBox = await statement.boundingBox();
          const formBox = await account.boundingBox();

          return Boolean(
            uploadBox &&
            formBox &&
            uploadBox.y + uploadBox.height <= formBox.y &&
            Math.abs(uploadBox.width - formBox.width) < 1
          );
        })
        .toBe(true);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth
          )
        )
        .toBe(true);
      await statement.getByRole('button', { name: 'Upload statement' }).focus();
      await page.keyboard.press('Tab');
      await expect(
        bankPage.getByRole('textbox', {
          name: 'Account display name',
          exact: true,
        })
      ).toBeFocused();
      await page.setViewportSize({ width: 1440, height: 1000 });
    });

    const bankDetailsHelp = bankPage.getByRole('button', {
      name: 'Why are we asking for this?',
    });

    // Pointer travel depends on the tooltip portal's browser geometry.
    await bankDetailsHelp.hover();

    // Radix exposes the accessible tooltip through a hidden text mirror;
    // pointer travel must target the visible portal surface.
    const explanation = page.locator('[data-slot="tooltip-content"]');

    await expect(explanation).toBeVisible();
    await explanation.hover();
    await expect(explanation).toBeVisible();
    await bankPage
      .getByRole('heading', { name: 'Create bank account', exact: true })
      .hover();
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await bankDetailsHelp.click();
    await expect(page.getByRole('tooltip')).toHaveText(
      'We collect these details to ensure accurate reconciliation and smooth transaction tracking with your financial institution.'
    );
    await bankDetailsHelp.click();

    // Verify default jurisdiction NG triggered automatic bank loading without manual country reselection
    await expect.poll(() => requestedBankCountry).toBe('NG');

    await test.step('Cancellation clears the draft and statement', async () => {
      // Fill form and attach file
      await bankPage
        .getByRole('textbox', { name: 'Account display name', exact: true })
        .fill('Draft Account');
      const draftFileInput = bankPage.locator('input[type="file"]');
      await draftFileInput.setInputFiles({
        name: 'draft-statement.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('draft content'),
      });
      await expect(bankPage.getByText('draft-statement.pdf')).toBeVisible();

      await page.goBack();
      await expect(page).toHaveURL('/accounts');

      // Reopen the dedicated page
      await page.getByRole('button', { name: 'Add account' }).click();
      await selectionDialog
        .getByRole('radio', { name: /bank account/i })
        .click();
      await selectionDialog.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL('/accounts/new/bank');
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'Create bank account', level: 1 })
      ).toBeVisible();

      // Verify the new page form and statement upload are clean
      await expect(bankPage).toBeVisible();
      await expect(
        bankPage.getByRole('textbox', {
          name: 'Account display name',
          exact: true,
        })
      ).toHaveValue('');
      await expect(bankPage.getByText('draft-statement.pdf')).not.toBeVisible();
    });
    // Attach local statement PDF
    const fileInput = bankPage.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bank-statement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content'),
    });
    await expect(bankPage.getByText('bank-statement.pdf')).toBeVisible();

    // Intercept POST request
    let attempts = 0;
    let capturedRequestBody: IBankAccountCreationReq | null = null;
    await page.route(createBankAccountEndpoint, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
        attempts += 1;
        if (attempts === 1) {
          await route.fulfill({
            status: 500,
            json: { name: 'UnexpectedError' },
          });

          return;
        }

        await route.fulfill({
          status: 201,
          json: { id: 'new-bank-account-id' },
        });
      } else {
        await route.fallback();
      }
    });

    // Fill form
    await bankPage
      .getByRole('textbox', { name: 'Account display name', exact: true })
      .fill('Main Operating Account');

    // Select bank name (automatically populated for NG)
    await bankPage.getByRole('combobox', { name: 'Bank name' }).click();
    await page.getByRole('option', { name: 'Access Bank' }).click();

    // Fill account number and account name
    await bankPage
      .getByRole('textbox', { name: 'Bank account number' })
      .fill('0123456789');
    await bankPage
      .getByRole('textbox', { name: 'Bank account name' })
      .fill('Acme Corp');

    // Fill opening balance
    await bankPage
      .getByRole('textbox', { name: 'Opening balance' })
      .fill('5000');

    // Select opening date via DateInput calendar
    await bankPage.getByRole('button', { name: /opening date/i }).click();
    await page.getByRole('gridcell', { name: '15' }).first().click();

    // Submit form
    const createButton = bankPage.getByRole('button', {
      name: /create account/i,
    });

    await expect(createButton).toBeEnabled();
    await createButton.click();

    await test.step('A settled failure retains the form and selected statement', async () => {
      await expect(
        page.getByText('An error occurred', { exact: true })
      ).toBeVisible();
      await expect(createButton).toBeEnabled();
      await expect(bankPage.getByText('bank-statement.pdf')).toBeVisible();
      await expect(
        bankPage.getByRole('textbox', {
          name: 'Account display name',
          exact: true,
        })
      ).toHaveValue('Main Operating Account');
      await expect(
        bankPage.getByRole('textbox', { name: 'Bank account number' })
      ).toHaveValue('0123456789');
      await createButton.click();
    });
    // Assert success feedback and navigation back to Accounts
    await expect(
      page.getByText('Bank account created successfully')
    ).toBeVisible();
    await expect(page).toHaveURL('/accounts');
    await page.goBack();
    await expect(page).toHaveURL('/accounts');

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
    expect(attempts).toBe(2);
  });
});
