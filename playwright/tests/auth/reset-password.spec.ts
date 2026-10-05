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

test('renders main landmark, level-one heading, exact brand link, and back-to-signin link', async ({
  page,
}) => {
  await page.goto(`/auth/reset-password?token=${validToken}`);

  const main = page.getByRole('main');
  await expect(main).toBeVisible();

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveText('Reset your password');

  const brandLink = page.getByRole('link', { name: 'Drimsheet' });
  await expect(brandLink).toBeVisible();
  await expect(brandLink).toHaveAttribute('href', '/');

  const backLink = page.getByRole('link', { name: 'Back to sign in' });
  await expect(backLink).toBeVisible();
  await expect(backLink).toHaveAttribute('href', '/auth/signin');
});

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

test('associates validation errors with input via aria-invalid and aria-describedby', async ({
  page,
}) => {
  await page.goto(`/auth/reset-password?token=${validToken}`);

  const passwordInput = page.getByLabel('New Password');
  const confirmPasswordInput = page.getByLabel('Confirm Password');
  const submitButton = page.getByRole('button', { name: 'Reset password' });

  await submitButton.click();

  const passwordError = page.getByText('Password is required', {
    exact: true,
  });

  await expect(passwordError).toBeVisible();
  await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
  const passwordErrorId = await passwordError.getAttribute('id');
  expect(passwordErrorId).toBeTruthy();
  await expect(passwordInput).toHaveAttribute(
    'aria-describedby',
    passwordErrorId!
  );

  const confirmError = page.getByText('Confirm Password is required', {
    exact: true,
  });

  await expect(confirmError).toBeVisible();
  await expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
  const confirmErrorId = await confirmError.getAttribute('id');
  expect(confirmErrorId).toBeTruthy();
  await expect(confirmPasswordInput).toHaveAttribute(
    'aria-describedby',
    confirmErrorId!
  );

  await passwordInput.fill('ValidPassword123!');
  await confirmPasswordInput.fill('MismatchPassword456!');
  await submitButton.click();

  const mismatchError = page.getByText('Passwords must match');
  await expect(mismatchError).toBeVisible();
  await expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
});

test('gates request, disables controls, and sends exactly one POST', async ({
  page,
}) => {
  const responseGate = createResponseGate();
  let requestCount = 0;
  let postData: unknown = null;

  await page.route(resetEndpoint, async (route) => {
    requestCount += 1;
    postData = route.request().postDataJSON();
    await responseGate.promise;
    await route.fulfill({
      status: 200,
      json: { accessToken: 'new-access-token' },
    });
  });

  await page.goto(`/auth/reset-password?token=${validToken}`);

  const passwordInput = page.getByLabel('New Password');
  const confirmPasswordInput = page.getByLabel('Confirm Password');
  const submitButton = page.getByRole('button', { name: 'Reset password' });

  await passwordInput.fill('ValidPassword123!');
  await confirmPasswordInput.fill('ValidPassword123!');

  await submitButton.click();
  await passwordInput.press('Enter');
  await submitButton.click({ force: true }).catch(() => {});

  await expect(passwordInput).toBeDisabled();
  await expect(confirmPasswordInput).toBeDisabled();
  await expect(submitButton).toBeDisabled();

  responseGate.resolve();

  await expect(page).toHaveURL('/dashboard');
  expect(requestCount).toBe(1);
  expect(postData).toEqual({
    password: 'ValidPassword123!',
    confirmPassword: 'ValidPassword123!',
    token: validToken,
  });
});

test('handles API error without clearing entered form state', async ({
  page,
}) => {
  await page.route(resetEndpoint, async (route) => {
    await route.fulfill({
      status: 400,
      json: {
        name: 'BadRequestError',
        errorKey: 'invalid_token',
        validationErrors: [],
      },
    });
  });

  await page.goto(`/auth/reset-password?token=${validToken}`);

  const passwordInput = page.getByLabel('New Password');
  const confirmPasswordInput = page.getByLabel('Confirm Password');
  const submitButton = page.getByRole('button', { name: 'Reset password' });

  await passwordInput.fill('ValidPassword123!');
  await confirmPasswordInput.fill('ValidPassword123!');
  await submitButton.click();

  await expect(passwordInput).toBeVisible();
  await expect(passwordInput).toHaveValue('ValidPassword123!');
  await expect(confirmPasswordInput).toHaveValue('ValidPassword123!');
});

test('navigates to /auth/signin when Back to sign in is clicked', async ({
  page,
}) => {
  await page.goto(`/auth/reset-password?token=${validToken}`);

  await page.getByRole('link', { name: 'Back to sign in' }).click();
  await expect(page).toHaveURL('/auth/signin');
});

test('reflows at 320px viewport without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`/auth/reset-password?token=${validToken}`);

  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  );

  expect(scrollWidth).toBeLessThanOrEqual(320);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByLabel('New Password')).toBeVisible();
  await expect(page.getByLabel('Confirm Password')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Reset password' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to sign in' })
  ).toBeVisible();
});
