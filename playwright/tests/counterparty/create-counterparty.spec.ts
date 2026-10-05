import type { ICounterpartyCreateReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const jurisdictionsEndpoint = '**/api/v1/accounting/jurisdictions';

const createCounterpartyEndpoint = '**/api/v1/counterparties';

async function registerCounterpartyPageRoutes(page: Page) {
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

  await page.route(jurisdictionsEndpoint, async (route) => {
    await route.fulfill({
      json: [
        {
          code: 'NG',
          name: 'Nigeria',
          currencyCode: 'NGN',
          maxFiscalMonths: 12,
          accountingStandards: {
            code: 'IFRS',
            name: 'International Financial Reporting Standards',
          },
        },
        {
          code: 'US',
          name: 'United States',
          currencyCode: 'USD',
          maxFiscalMonths: 12,
          accountingStandards: {
            code: 'GAAP',
            name: 'Generally Accepted Accounting Principles',
          },
        },
      ],
    });
  });

  await page.route(/\/api\/v1\/counterparties(\?|$)/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        json: {
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        },
      });
    } else {
      await route.fallback();
    }
  });
}

async function signInAndNavigateToCounterparties(page: Page) {
  await registerCounterpartyPageRoutes(page);

  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');

  await page.goto('/counterparties');
  await expect(page).toHaveURL('/counterparties');
}

test.describe('Counterparty Selection and Creation Flow', () => {
  test('opens selection dialog, dismisses it, and can select and navigate to creation forms', async ({
    page,
  }) => {
    await signInAndNavigateToCounterparties(page);

    const triggerButton = page.getByRole('button', {
      name: /add counterparty/i,
    });

    await expect(triggerButton).toBeVisible();
    await triggerButton.click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await expect(selectionDialog).toBeVisible();

    // Dismiss via Escape
    await page.keyboard.press('Escape');
    await expect(selectionDialog).not.toBeVisible();

    // Reopen and check routing to default creation form
    await triggerButton.click();
    await expect(selectionDialog).toBeVisible();
    await selectionDialog.getByRole('radio', { name: /default/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();
    await expect(selectionDialog).not.toBeVisible();

    const creationDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /^create counterparty$/i }),
    });

    await expect(creationDialog).toBeVisible();
  });

  test('successfully creates a default counterparty', async ({ page }) => {
    await signInAndNavigateToCounterparties(page);

    await page.getByRole('button', { name: /add counterparty/i }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await selectionDialog.getByRole('radio', { name: /default/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const creationDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /^create counterparty$/i }),
    });

    await expect(creationDialog).toBeVisible();

    // Fill standard counterparty form
    await creationDialog
      .getByRole('textbox', { name: /name/i })
      .fill('John Default');
    await creationDialog.getByRole('combobox', { name: /type/i }).click();
    await page.getByRole('option', { name: /individual/i }).click();

    // Intercept POST
    let capturedBody: ICounterpartyCreateReq | null = null;
    await page.route(createCounterpartyEndpoint, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();

        return;
      }

      capturedBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 201,
        json: { id: 'new-counterparty-id' },
      });
    });

    await creationDialog.getByRole('button', { name: /create/i }).click();

    await expect(
      page.getByText('Counterparty created successfully')
    ).toBeVisible();
    await expect(creationDialog).not.toBeVisible();
    expect(capturedBody).toEqual({
      name: 'John Default',
      type: 'individual',
      status: 'active',
    });
  });

  test('successfully creates a vendor counterparty with address and display name', async ({
    page,
  }) => {
    await signInAndNavigateToCounterparties(page);

    await page.getByRole('button', { name: /add counterparty/i }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await selectionDialog.getByRole('radio', { name: /vendor/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const vendorDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create vendor/i }),
    });

    await expect(vendorDialog).toBeVisible();

    // Fill form
    await vendorDialog
      .getByRole('textbox', { name: /legal name/i })
      .fill('Acme Supplies');
    await vendorDialog.getByRole('combobox', { name: /type/i }).click();
    await page.getByRole('option', { name: /organization/i }).click();

    await vendorDialog
      .getByRole('textbox', { name: /display name/i })
      .fill('Acme');
    await vendorDialog
      .getByRole('textbox', { name: 'Address', exact: true })
      .fill('123 Vendor Rd');
    await vendorDialog.getByPlaceholder('Select a country').click();
    await page.getByRole('option', { name: 'Nigeria' }).click();
    await vendorDialog
      .getByRole('textbox', { name: /state/i })
      .fill('Lagos State');
    await vendorDialog.getByRole('textbox', { name: /city/i }).fill('Ikeja');

    // Intercept POST
    let capturedBody: ICounterpartyCreateReq | null = null;
    await page.route(createCounterpartyEndpoint, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();

        return;
      }

      capturedBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 201,
        json: { id: 'new-vendor-id' },
      });
    });

    await vendorDialog.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText('Vendor created successfully')).toBeVisible();
    await expect(vendorDialog).not.toBeVisible();
    expect(capturedBody).toEqual({
      name: 'Acme Supplies',
      type: 'organization',
      status: 'active',
      meta: {
        vendor: {
          address: {
            line1: '123 Vendor Rd',
            city: 'Ikeja',
            region: 'Lagos State',
            countryCode: 'NG',
          },
        },
      },
    });
  });

  test('successfully creates a contractor counterparty', async ({ page }) => {
    await signInAndNavigateToCounterparties(page);

    await page.getByRole('button', { name: /add counterparty/i }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await selectionDialog.getByRole('radio', { name: /contractor/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const contractorDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create contractor/i }),
    });

    await expect(contractorDialog).toBeVisible();

    // Fill form
    await contractorDialog
      .getByRole('textbox', { name: /legal name/i })
      .fill('Jane Smith');
    await contractorDialog.getByRole('combobox', { name: /type/i }).click();
    await page.getByRole('option', { name: /individual/i }).click();

    await contractorDialog
      .getByRole('textbox', { name: 'Address', exact: true })
      .fill('456 Contractor Way');
    await contractorDialog.getByPlaceholder('Select a country').click();
    await page.getByRole('option', { name: 'United States' }).click();
    await contractorDialog
      .getByRole('textbox', { name: /city/i })
      .fill('San Francisco');

    // Intercept POST
    let capturedBody: ICounterpartyCreateReq | null = null;
    await page.route(createCounterpartyEndpoint, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();

        return;
      }

      capturedBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 201,
        json: { id: 'new-contractor-id' },
      });
    });

    await contractorDialog.getByRole('button', { name: /create/i }).click();

    await expect(
      page.getByText('Contractor created successfully')
    ).toBeVisible();
    await expect(contractorDialog).not.toBeVisible();
    expect(capturedBody).toEqual({
      name: 'Jane Smith',
      type: 'individual',
      status: 'active',
      meta: {
        contractor: {
          address: {
            line1: '456 Contractor Way',
            city: 'San Francisco',
            countryCode: 'US',
          },
        },
      },
    });
  });

  test('successfully creates an employer counterparty with display name', async ({
    page,
  }) => {
    await signInAndNavigateToCounterparties(page);

    await page.getByRole('button', { name: /add counterparty/i }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await selectionDialog.getByRole('radio', { name: /employer/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const employerDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /create employer/i }),
    });

    await expect(employerDialog).toBeVisible();

    // Fill form
    await employerDialog
      .getByRole('textbox', { name: /legal name/i })
      .fill('MegaCorp International');
    await employerDialog.getByRole('combobox', { name: /type/i }).click();
    await page.getByRole('option', { name: /organization/i }).click();

    await employerDialog
      .getByRole('textbox', { name: /display name/i })
      .fill('MegaCorp');
    await employerDialog
      .getByRole('textbox', { name: 'Address', exact: true })
      .fill('789 Employer Lane');
    await employerDialog.getByPlaceholder('Select a country').click();
    await page.getByRole('option', { name: 'United States' }).click();
    await employerDialog
      .getByRole('textbox', { name: /city/i })
      .fill('New York');

    // Intercept POST
    let capturedBody: ICounterpartyCreateReq | null = null;
    await page.route(createCounterpartyEndpoint, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();

        return;
      }

      capturedBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 201,
        json: { id: 'new-employer-id' },
      });
    });

    await employerDialog.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText('Employer created successfully')).toBeVisible();
    await expect(employerDialog).not.toBeVisible();
    expect(capturedBody).toEqual({
      name: 'MegaCorp International',
      type: 'organization',
      status: 'active',
      meta: {
        employer: {
          displayName: 'MegaCorp',
          address: {
            line1: '789 Employer Lane',
            city: 'New York',
            countryCode: 'US',
          },
        },
      },
    });
  });

  test('retains input values on API creation failure', async ({ page }) => {
    await signInAndNavigateToCounterparties(page);

    await page.route(createCounterpartyEndpoint, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();

        return;
      }

      await route.fulfill({
        status: 500,
        json: { message: 'Failed to create counterparty' },
      });
    });

    await page.getByRole('button', { name: /add counterparty/i }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await selectionDialog.getByRole('radio', { name: /default/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const creationDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /^create counterparty$/i }),
    });

    await creationDialog
      .getByRole('textbox', { name: /name/i })
      .fill('Failed Counterparty Name');
    await creationDialog.getByRole('button', { name: /create/i }).click();

    // Dialog remains open and value is retained
    await expect(creationDialog).toBeVisible();
    await expect(
      creationDialog.getByRole('textbox', { name: /name/i })
    ).toHaveValue('Failed Counterparty Name');
  });

  test('resets form state after dismissal and reopening', async ({ page }) => {
    await signInAndNavigateToCounterparties(page);

    await page.getByRole('button', { name: /add counterparty/i }).click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });

    await selectionDialog.getByRole('radio', { name: /default/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    const creationDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /^create counterparty$/i }),
    });

    await creationDialog
      .getByRole('textbox', { name: /name/i })
      .fill('Draft Name');

    // Dismiss via Escape
    await page.keyboard.press('Escape');
    await expect(creationDialog).not.toBeVisible();

    // Reopen and verify it's clean
    await page.getByRole('button', { name: /add counterparty/i }).click();
    await selectionDialog.getByRole('radio', { name: /default/i }).click();
    await selectionDialog.getByRole('button', { name: /continue/i }).click();

    await expect(creationDialog).toBeVisible();
    await expect(
      creationDialog.getByRole('textbox', { name: /name/i })
    ).toHaveValue('');
  });
});
