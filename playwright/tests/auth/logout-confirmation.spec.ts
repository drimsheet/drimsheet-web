import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

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

async function openHostPage(page: Page) {
  await registerAuthenticatedAppRoutes(page);

  await page.goto('/dashboard');
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

test('cancels without logging out and prevents dismissal while a logout is pending', async ({
  page,
}) => {
  const responseGate = createResponseGate();
  let logoutRequestCount = 0;

  await openHostPage(page);
  await page.route(logoutEndpoint, async (route) => {
    logoutRequestCount += 1;
    expect(route.request().method()).toBe('POST');
    await responseGate.promise;
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
  await test.step('Cancellation keeps the session', async () => {
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
  await openLogoutDialog(page);
  const logoutButton = dialog.getByRole('button', { name: 'Log out' });

  await logoutButton.click();

  await expect(
    dialog.getByRole('button', { name: 'Logging out...', exact: true })
  ).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(
    dialog.getByRole('button', { name: 'Logging out...', exact: true })
  ).toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => logoutRequestCount).toBe(1);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Enter');
  expect(logoutRequestCount).toBe(1);

  responseGate.resolve();
  await expect(page.getByText(logoutFailureMessage)).toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Log out', exact: true })
  ).toBeEnabled();
});
