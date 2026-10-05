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

test('announces pending verification and sends one request', async ({
  page,
}) => {
  const responseGate = createResponseGate();
  let requestCount = 0;

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

  await page.goto(verificationUrl);

  const main = page.getByRole('main');
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status')).toHaveText('Verifying your email');

  responseGate.resolve();

  await expect(page).toHaveURL('/auth/signup');
  expect(requestCount).toBe(1);
});

test('verifies the email and replaces the route with the dashboard', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route(verificationEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

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
});

test('shows an API error without retaining a replayable verification URL', async ({
  page,
}) => {
  let requestCount = 0;

  await page.goto('/auth/signin');
  await page.route(verificationEndpoint, async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 400,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_token_invalid_unauthorized',
        validationErrors: [],
      },
    });
  });

  await page.goto(verificationUrl);

  await expect(page.getByText('Invalid token.')).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');

  await page.goBack();

  await expect(page).toHaveURL('/auth/signin');
  expect(requestCount).toBe(1);
});

for (const tokenCase of [
  { name: 'missing', url: '/auth/signup/complete' },
  { name: 'empty', url: '/auth/signup/complete?token=' },
]) {
  test(`rejects a ${tokenCase.name} verification token without an API request`, async ({
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

    await page.goto(tokenCase.url);

    await expect(
      page.getByText(
        'This verification link is invalid. Request a new link or sign up again.'
      )
    ).toBeVisible();
    await expect(page).toHaveURL('/auth/signup');
    expect(requestCount).toBe(0);
  });
}

test('stops the pulse animation when reduced motion is requested', async ({
  page,
}) => {
  const responseGate = createResponseGate();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(verificationEndpoint, async (route) => {
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

  await page.goto(verificationUrl);

  const status = page.getByRole('status');
  await expect(status).toHaveText('Verifying your email');
  await expect
    .poll(() =>
      status
        .locator('img')
        .evaluate((image) => getComputedStyle(image).animationName)
    )
    .toBe('none');

  responseGate.resolve();
  await expect(page).toHaveURL('/auth/signup');
});
