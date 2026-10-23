import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

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

test('retains reset inputs after rejection, then submits once and reaches the dashboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await registerAuthenticatedAppRoutes(page);
  const responseGate = createResponseGate();
  let requestCount = 0;
  let postData: unknown = null;

  await page.route(resetEndpoint, async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await route.fulfill({
        status: 400,
        json: {
          name: 'BadRequestError',
          errorKey: 'auth_error_token_invalid_unauthorized',
          validationErrors: [],
        },
      });

      return;
    }

    postData = route.request().postDataJSON();
    await responseGate.promise;
    await route.fulfill({
      status: 200,
      json: { accessToken: 'new-access-token' },
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

  await test.step('Failure handling settles before input retention is checked', async () => {
    await submitButton.click();
    await expect(page.getByText('Invalid token.')).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await expect(passwordInput).toHaveValue('ValidPassword123!');
    await expect(confirmPasswordInput).toHaveValue('ValidPassword123!');
  });
  await test.step('Narrow form submits only once while pending', async () => {
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
      .toBe(true);
    await submitButton.click();
    await passwordInput.press('Enter');
    await submitButton.click({ force: true }).catch(() => {});

    await expect(passwordInput).toBeDisabled();
    await expect(confirmPasswordInput).toBeDisabled();
    await expect(submitButton).toBeDisabled();

    responseGate.resolve();
  });
  await test.step('Submission completes successfully', async () => {
    await expect(page).toHaveURL('/dashboard');
    expect(requestCount).toBe(2);
    expect(postData).toEqual({
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      token: validToken,
    });
  });
});
