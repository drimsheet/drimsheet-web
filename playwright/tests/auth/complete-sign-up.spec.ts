import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

const verificationEndpoint = '**/api/v1/auth/signup/complete**';
const verificationToken = 'integration-verification-token';
const verificationUrl = `/auth/signup/complete?token=${verificationToken}`;

function createResponseGate() {
  let resolve = () => {};

  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

test('announces pending verification and rejects it without retaining a replayable URL', async ({
  page,
}) => {
  const responseGate = createResponseGate();
  let requestCount = 0;

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.route(verificationEndpoint, async (route) => {
    requestCount += 1;
    await responseGate.promise;
    await route.fulfill({
      status: 400,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_token_invalid_unauthorized',
        validationErrors: [],
      },
    });
  });

  await page.goto('/auth/signin');
  await page.goto(verificationUrl);

  const main = page.getByRole('main');
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute('aria-busy', 'true');
  const status = page.getByRole('status');
  await expect(status).toHaveText('Verifying your email');
  await expect
    .poll(() =>
      status
        .locator('[aria-hidden="true"]')
        .evaluate((logo) => getComputedStyle(logo).animationName)
    )
    .toBe('none');

  responseGate.resolve();
  await expect(page.getByText('Invalid token.')).toBeVisible();

  await expect(page).toHaveURL('/auth/signup');
  expect(requestCount).toBe(1);
  await page.goBack();
  await expect(page).toHaveURL('/auth/signin');
  expect(requestCount).toBe(1);
});

test('verifies the email and replaces the route with the dashboard', async ({
  page,
}) => {
  let requestCount = 0;
  await registerAuthenticatedAppRoutes(page);
  await page.route(verificationEndpoint, async (route) => {
    requestCount++;
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.goto('/auth/signin');
  const verificationRequest = page.waitForRequest(verificationEndpoint);

  await page.goto(verificationUrl);

  const request = await verificationRequest;

  expect(request.method()).toBe('POST');
  expect(request.postDataJSON()).toEqual({ token: verificationToken });
  await expect(page.getByText('Email verified successfully')).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
  expect(await page.evaluate(() => localStorage.getItem('isLoggedIn'))).toBe(
    'true'
  );
  await page.evaluate(() => localStorage.removeItem('isLoggedIn'));
  await page.goBack();
  await expect(page).toHaveURL('/auth/signin');
  expect(requestCount).toBe(1);
});

test('rejects a missing verification token without an API request', async ({
  page,
}) => {
  let requestCount = 0;

  await page.route(verificationEndpoint, async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 500,
      json: {},
    });
  });

  await page.goto('/auth/signup/complete');

  await expect(
    page.getByText(
      'This verification link is invalid. Request a new link or sign up again.'
    )
  ).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');
  expect(requestCount).toBe(0);
});
