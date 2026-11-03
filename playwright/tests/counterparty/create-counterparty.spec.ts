import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

const jurisdictionsEndpoint = '**/api/v1/accounting/jurisdictions';

async function registerCounterpartyPageRoutes(page: Page) {
  await registerAuthenticatedAppRoutes(page);

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

for (const role of ['default', 'vendor', 'contractor', 'employer'] as const) {
  test(`selects the ${role} creation form from the page`, async ({ page }) => {
    await registerCounterpartyPageRoutes(page);
    await page.goto('/counterparties');
    await page.getByRole('button', { name: /add person or business/i }).click();
    const selector = page.getByRole('dialog', { name: /select a role/i });
    await selector.getByRole('radio', { name: new RegExp(role, 'i') }).click();
    await selector.getByRole('button', { name: /continue/i }).click();
    await expect(selector).not.toBeVisible();

    const title =
      role === 'default' ? 'Create person or business' : `Create ${role}`;

    const form = page.getByRole('dialog', { name: title, exact: true });
    await expect(form).toBeVisible();
    await expect(
      form.getByRole('textbox', {
        name: role === 'default' ? 'Name' : 'Legal name',
        exact: true,
      })
    ).toBeEnabled();
  });
}
