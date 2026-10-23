import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';

const email = authenticatedUser.email;
const password = 'Password1!';
const loginEndpoint = '**/api/v1/auth/login-with-email';

test.beforeEach(async ({ page }) => {
  await page.goto('/auth/signin');
});

test('navigates to forgot password and sign-up pages', async ({ page }) => {
  await test.step('Password reset navigation', async () => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL('/auth/forgot-password');
    await page.getByRole('link', { name: 'Back to sign in' }).click();
    await expect(page).toHaveURL('/auth/signin');
    await page.goto('/auth/reset-password?token=navigation-token');
    await page.getByRole('link', { name: 'Back to sign in' }).click();
    await expect(page).toHaveURL('/auth/signin');
  });
  await test.step('Signup navigation', async () => {
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/auth/signup');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/auth/signin');
  });
});

test('rejects invalid credentials, then signs in once from a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await registerAuthenticatedAppRoutes(page);
  let requestCount = 0;
  let fulfillRoute: () => void = () => {};

  const routePromise = new Promise<void>((resolve) => {
    fulfillRoute = resolve;
  });

  await page.route(loginEndpoint, async (route) => {
    requestCount++;
    expect(route.request().method()).toBe('POST');
    if (requestCount === 1) {
      await route.fulfill({
        status: 401,
        json: {
          name: 'AuthenticationError',
          errorKey: 'auth_error_credentials_invalid_unauthorized',
          validationErrors: [],
        },
      });

      return;
    }

    expect(route.request().postDataJSON()).toEqual({ email, password });
    await routePromise;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'integration-test-token' }),
    });
  });

  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sign In' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Drimsheet', exact: true })
  ).toBeVisible();
  await test.step('Auth controls fit the narrow viewport', async () => {
    for (const control of [
      page.getByLabel('Email'),
      page.getByLabel('Password', { exact: true }),
      page.getByRole('button', { name: 'Sign In' }),
      page.getByRole('button', { name: 'Continue with Google' }),
    ]) {
      await control.scrollIntoViewIfNeeded();
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
    }

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);

  const submitBtn = page.getByRole('button', { name: 'Sign In' });
  await test.step('Settled rejection preserves the form', async () => {
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword1!');
    await submitBtn.click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(submitBtn).toBeEnabled();
    await expect(page.getByLabel('Email')).toHaveValue(email);
    await expect(page).toHaveURL('/auth/signin');
    await page.getByLabel('Password', { exact: true }).fill(password);
  });
  await submitBtn.click();

  await expect(page.getByLabel('Email')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'readonly',
    ''
  );
  await expect(page.getByLabel('Email')).not.toBeDisabled();
  await expect(page.getByLabel('Password', { exact: true })).not.toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Show password' })
  ).not.toBeDisabled();
  await expect(submitBtn).toBeDisabled();

  await page.keyboard.press('Enter');
  await submitBtn.click({ force: true }).catch(() => {});

  await test.step('Successful authentication loads the protected app', async () => {
    fulfillRoute();
    await expect(page).toHaveURL('/dashboard');
    await page
      .getByRole('button', { name: 'Toggle Sidebar', exact: true })
      .click();
    await expect(
      page.getByRole('button', {
        name: 'Open account management for Integration Entity',
      })
    ).toBeVisible();
    expect(requestCount).toBe(2);
  });
});

test('redirects to Google authentication endpoint when Google button is clicked', async ({
  page,
}) => {
  let loginCalled = false;
  let googleCalled = false;

  await page.route(loginEndpoint, async (route) => {
    loginCalled = true;
    await route.fulfill({ status: 500 });
  });

  await page.route('**/api/v1/auth/google', async (route) => {
    googleCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body>Google Auth Page</body></html>',
    });
  });

  await page.getByRole('button', { name: 'Continue with Google' }).click();

  await expect.poll(() => googleCalled).toBe(true);
  expect(loginCalled).toBe(false);
});
