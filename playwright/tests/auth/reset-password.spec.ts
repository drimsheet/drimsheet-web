import { expect, test } from '@integration/fixtures/test';

const resetEndpoint = '**/api/v1/auth/reset-password';

const validToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function createResponseGate() {
  let resolve = () => {};

  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

test('handles missing token parameter gracefully', async ({ page }) => {
  await page.goto('/auth/reset-password');

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(
    'This verification link is invalid. Request a new link or sign up again.'
  );

  const requestLink = page.getByRole('link', {
    name: 'Get password reset link',
  });

  await expect(requestLink).toBeVisible();
  await expect(requestLink).toHaveAttribute('href', '/auth/forgot-password');
});

test('coordinates pending controls and retains reset inputs after rejection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const responseGate = createResponseGate();
  await page.route(resetEndpoint, async (route) => {
    await responseGate.promise;
    await route.fulfill({
      status: 400,
      json: {
        name: 'BadRequestError',
        errorKey: 'auth_error_token_invalid_unauthorized',
        validationErrors: [],
      },
    });
  });

  await page.goto(`/auth/reset-password?token=${validToken}`);

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Reset your password'
  );
  const brandLink = page.getByRole('link', { name: 'Drimsheet', exact: true });
  await expect(brandLink).toBeVisible();
  await expect(brandLink).toHaveAttribute('href', '/');
  const backLink = page.getByRole('link', { name: 'Back to sign in' });
  await expect(backLink).toBeVisible();
  await expect(backLink).toHaveAttribute('href', '/auth/signin');

  const passwordInput = page.getByLabel('New Password');
  const confirmPasswordInput = page.getByLabel('Confirm Password');
  const submitButton = page.getByRole('button', { name: 'Reset password' });

  await passwordInput.fill('ValidPassword123!');
  await confirmPasswordInput.fill('ValidPassword123!');

  await submitButton.click();
  await expect(submitButton).toBeDisabled();
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
  responseGate.resolve();
  await expect(page.getByText('Invalid token.')).toBeVisible();
  await expect(submitButton).toBeEnabled();
  await expect(passwordInput).toHaveValue('ValidPassword123!');
  await expect(confirmPasswordInput).toHaveValue('ValidPassword123!');
});
