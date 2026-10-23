import { featureFlagKeys } from '@/shared/hooks/use-feature-flags';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const profileEndpoint = '**/api/v1/users/profile';
const accountingEntitiesEndpoint = '**/api/v1/accounting/accounting-entities';

async function registerLoginRoute(page: Page) {
  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });
  await page.route(refreshEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test.describe('when Alpha 1 access is denied', () => {
  test.use({
    launchDarklyFlagValues: {
      [featureFlagKeys.accessAlpha1]: false,
    },
  });

  test('shows the unavailable state across protected route branches without bootstrapping accounting', async ({
    page,
  }) => {
    let accountingRequestCount = 0;
    await registerLoginRoute(page);
    await page.route(profileEndpoint, async (route) => {
      await route.fulfill({ json: authenticatedUser });
    });
    await page.route(accountingEntitiesEndpoint, async (route) => {
      accountingRequestCount++;
      await route.fulfill({ json: [] });
    });

    await signIn(page);

    for (const path of [
      '/dashboard',
      '/accounts',
      '/counterparties',
      '/transactions/inflow',
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(path);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: "This feature isn't available to you",
        })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Request access' })
      ).toBeVisible();
    }

    await page.getByRole('button', { name: 'Request access' }).click();
    await expect(page).toHaveURL('/transactions/inflow');
    expect(accountingRequestCount).toBe(0);
  });

  test('keeps auth routes outside the feature flag wrapper', async ({
    page,
  }) => {
    await page.goto('/auth/signin');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign In' })
    ).toBeVisible();

    await page.goto('/auth/signup');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Create account' })
    ).toBeVisible();
  });

  test('redirects a logged-out protected route to sign in before evaluating flags', async ({
    page,
  }) => {
    await page.route(refreshEndpoint, async (route) => {
      await route.fulfill({ status: 401 });
    });

    await page.goto('/dashboard');

    await expect(page).toHaveURL('/auth/signin');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign In' })
    ).toBeVisible();
  });
});

test('allows an authenticated user into the application when Alpha 1 is enabled', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await registerLoginRoute(page);

  await signIn(page);

  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
});

test('uses the unavailable state for a Core feature-flag error', async ({
  page,
}) => {
  await registerLoginRoute(page);
  await page.route(profileEndpoint, async (route) => {
    await route.fulfill({ json: authenticatedUser });
  });
  await page.route(accountingEntitiesEndpoint, async (route) => {
    await route.fulfill({
      status: 403,
      json: {
        name: 'FeatureFlagError',
        errorKey: 'feature_flag_error_forbidden',
        validationErrors: [],
      },
    });
  });

  await signIn(page);

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: "This feature isn't available to you",
    })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Request access' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).not.toBeVisible();
});
