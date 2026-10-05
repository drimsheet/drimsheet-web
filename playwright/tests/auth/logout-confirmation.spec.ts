import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const email = authenticatedUser.email;
const password = 'Password1!';
const loginEndpoint = '**/api/v1/auth/login-with-email';
const logoutEndpoint = '**/api/v1/auth/logout';
const dialogTitle = 'Are you sure you want to log out?';

const dialogDescription =
  'You will need to log back in to access your account.';

const logoutFailureMessage = 'Missing token.';

function createResponseGate() {
  let resolve = () => {};

  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

async function signIn(page: Page) {
  await registerAuthenticatedAppRoutes(page);
  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
}

async function openLogoutDialog(page: Page) {
  await page
    .getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
    .click();

  const accountManagementDialog = page.getByRole('dialog', {
    name: 'Account management',
  });

  await accountManagementDialog
    .getByRole('button', { name: 'Log out' })
    .click();

  await expect(accountManagementDialog).not.toBeVisible();

  return page.getByRole('alertdialog', { name: dialogTitle });
}

test('opens with accessible title and description, then cancels without logout', async ({
  page,
}) => {
  let logoutRequestCount = 0;

  await signIn(page);
  await page.route(logoutEndpoint, async (route) => {
    logoutRequestCount += 1;
    await route.fulfill({ status: 204 });
  });

  const dialog = await openLogoutDialog(page);

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(dialogDescription);

  const cancelButton = dialog.getByRole('button', { name: 'Cancel' });
  await expect(cancelButton).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Log out' })).toBeFocused();

  await cancelButton.click();

  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL('/dashboard');
  expect(logoutRequestCount).toBe(0);
});

test('keeps a single pending logout request and disables dialog actions', async ({
  page,
}) => {
  const responseGate = createResponseGate();
  let logoutRequestCount = 0;

  await signIn(page);
  await page.route(logoutEndpoint, async (route) => {
    logoutRequestCount += 1;
    await responseGate.promise;
    await route.fulfill({ status: 204 });
  });

  const dialog = await openLogoutDialog(page);
  const logoutButton = dialog.getByRole('button', { name: 'Log out' });

  await logoutButton.click();

  await expect(
    dialog.getByRole('button', { name: 'Logging out...' })
  ).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(
    dialog.getByRole('button', { name: 'Logging out...' })
  ).toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => logoutRequestCount).toBe(1);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Enter');
  expect(logoutRequestCount).toBe(1);

  responseGate.resolve();

  await expect(page).toHaveURL('/auth/signin');
  expect(logoutRequestCount).toBe(1);
});

test('logs out, replaces dashboard history, and blocks cached protected UI', async ({
  page,
}) => {
  let logoutRequestCount = 0;

  await signIn(page);
  await page.route(logoutEndpoint, async (route) => {
    logoutRequestCount += 1;
    await route.fulfill({ status: 204 });
  });

  const logoutRequest = page.waitForRequest(logoutEndpoint);
  const dialog = await openLogoutDialog(page);

  await dialog.getByRole('button', { name: 'Log out' }).click();

  const request = await logoutRequest;

  expect(request.method()).toBe('POST');
  await expect(page).toHaveURL('/auth/signin');
  expect(await page.evaluate(() => localStorage.getItem('isLoggedIn'))).toBe(
    null
  );
  expect(logoutRequestCount).toBe(1);

  await page.goBack();

  await expect(page).toHaveURL('/auth/signin');
  await expect(
    page.getByRole('button', { name: /open account management/i })
  ).not.toBeVisible();
  await expect(page.getByText('Dashboard')).not.toBeVisible();

  await page.goto('/dashboard');

  await expect(page).toHaveURL('/auth/signin');
  await expect(
    page.getByRole('button', { name: /open account management/i })
  ).not.toBeVisible();
  await expect(page.getByText('Dashboard')).not.toBeVisible();
});

test('keeps the authenticated context and reports API errors when logout fails', async ({
  page,
}) => {
  let logoutRequestCount = 0;

  await signIn(page);
  await page.route(logoutEndpoint, async (route) => {
    logoutRequestCount += 1;
    await route.fulfill({
      status: 400,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_token_missing_unauthorized',
        validationErrors: [],
      },
    });
  });

  const dialog = await openLogoutDialog(page);

  await dialog.getByRole('button', { name: 'Log out' }).click();

  await expect(page.getByText(logoutFailureMessage)).toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('isLoggedIn'))).toBe(
    'true'
  );
  expect(logoutRequestCount).toBe(1);
});
