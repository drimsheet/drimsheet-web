import { expect, test } from '@integration/fixtures/test';
import { registerAccountDashboardRoutes } from '@integration/mocks/account-dashboard';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

const createBankAccountEndpoint = '**/api/v1/ledger/asset/bank';
const currenciesEndpoint = '**/api/v1/currencies*';
const banksEndpoint = '**/api/v1/banks*';

async function registerAccountPageRoutes(page: Page) {
  await registerAuthenticatedAppRoutes(page);
  await registerAccountDashboardRoutes(page);

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

test.describe('Bank account creation page', () => {
  test('coordinates the statement and account form and retains both after a failed save', async ({
    page,
  }) => {
    await registerAccountPageRoutes(page);
    await page.goto('/accounts/new/bank');

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

    // Attach local statement PDF
    const fileInput = bankPage.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bank-statement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content'),
    });
    await expect(bankPage.getByText('bank-statement.pdf')).toBeVisible();

    await page.route(createBankAccountEndpoint, (route) =>
      route.fulfill({ status: 500, json: { name: 'UnexpectedError' } })
    );

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
    });
  });
});
