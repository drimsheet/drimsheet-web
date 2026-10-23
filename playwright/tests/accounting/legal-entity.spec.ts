import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';

const timestamp = '2026-01-01T00:00:00Z';

test.beforeEach(async ({ page }) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/users/preferences', (route) =>
    route.fulfill({
      json: {
        userId: authenticatedUser.id,
        createdBy: authenticatedUser.id,
        lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
        appPreferences: { theme: 'light', appUsageMode: 'non_power_user' },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })
  );
  await page.route('**/api/v1/auth/refresh-access-token', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.route('**/api/v1/auth/login-with-email', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
});

test('opens the legal entity placeholder without requesting contexts', async ({
  page,
}) => {
  const contextRequests: string[] = [];

  await page.route('**/api/v1/accounting/*-contexts', async (route) => {
    contextRequests.push(route.request().url());
    await route.fulfill({ json: [] });
  });
  await page.getByRole('link', { name: 'Legal Entity', exact: true }).click();
  await expect(page).toHaveURL('/legal-entity');
  await expect(
    page.getByRole('link', { name: 'Legal Entity', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('Hello world', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Hello world', { exact: true })).toBeVisible();
  expect(contextRequests).toEqual([]);
});
