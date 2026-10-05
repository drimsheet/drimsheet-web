import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

const callbackUrl = '/auth/oauth-confirmation';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';

const failureMessage =
  "We couldn't complete your Google sign-in. Please try again.";

function createResponseGate() {
  let resolve = () => {};

  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

test('announces pending completion and sends one refresh request', async ({
  page,
}) => {
  const responseGate = createResponseGate();
  let requestCount = 0;

  await page.route(refreshEndpoint, async (route) => {
    requestCount += 1;
    await responseGate.promise;
    await route.fulfill({
      status: 401,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_missing_token',
        validationErrors: [],
      },
    });
  });

  await page.goto(callbackUrl);

  const main = page.getByRole('main');
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status')).toHaveText('Completing sign in');
  await expect.poll(() => requestCount).toBe(1);

  responseGate.resolve();

  await expect(page).toHaveURL('/auth/signin');
  await expect(page.getByText(failureMessage)).toBeVisible();
  expect(requestCount).toBe(1);
});

test('completes sign-in and replaces the callback with the dashboard', async ({
  page,
}) => {
  let refreshRequestCount = 0;

  await registerAuthenticatedAppRoutes(page);
  await page.route(refreshEndpoint, async (route) => {
    refreshRequestCount += 1;
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.goto('/auth/signin');
  const refreshRequest = page.waitForRequest(refreshEndpoint);

  await page.goto(callbackUrl);

  const request = await refreshRequest;

  expect(request.method()).toBe('POST');
  expect(request.postData()).toBeNull();
  await expect(page).toHaveURL('/dashboard');
  expect(await page.evaluate(() => localStorage.getItem('isLoggedIn'))).toBe(
    'true'
  );
  expect(refreshRequestCount).toBe(1);

  await page.evaluate(() => localStorage.removeItem('isLoggedIn'));
  await page.goBack();

  await expect(page).toHaveURL('/auth/signin');
  expect(refreshRequestCount).toBe(1);
});

test('handles a rejected completion without retaining the callback', async ({
  page,
}) => {
  let refreshRequestCount = 0;
  let profileRequestCount = 0;

  await page.route(refreshEndpoint, async (route) => {
    refreshRequestCount += 1;
    await route.fulfill({
      status: 401,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_missing_token',
        validationErrors: [],
      },
    });
  });
  await page.route('**/api/v1/users/profile', async (route) => {
    profileRequestCount += 1;
    await route.fulfill({ status: 500, json: {} });
  });

  await page.goto('/auth/signin');
  await page.goto(callbackUrl);

  await expect(page.getByText(failureMessage)).toBeVisible();
  await expect(page).toHaveURL('/auth/signin');
  expect(
    await page.evaluate(() => localStorage.getItem('isLoggedIn'))
  ).toBeNull();
  expect(profileRequestCount).toBe(0);

  await page.goBack();

  await expect(page).toHaveURL('/auth/signin');
  expect(refreshRequestCount).toBe(1);
});

test('rejects provider error parameters without starting completion', async ({
  page,
}) => {
  let refreshRequestCount = 0;

  await page.route(refreshEndpoint, async (route) => {
    refreshRequestCount += 1;
    await route.fulfill({ status: 500, json: {} });
  });

  await page.goto(
    `${callbackUrl}?error=access_denied&error_description=provider-secret-detail`
  );

  await expect(page.getByText(failureMessage)).toBeVisible();
  await expect(page.getByText('provider-secret-detail')).not.toBeVisible();
  await expect(page).toHaveURL('/auth/signin');
  expect(refreshRequestCount).toBe(0);
});

test('does not trust a legacy access token from the callback URL', async ({
  page,
}) => {
  const legacyToken = 'integration-untrusted-token';
  let refreshRequestCount = 0;
  let leakedAuthorizationHeader = false;

  page.on('request', (request) => {
    if (request.headers().authorization === `Bearer ${legacyToken}`) {
      leakedAuthorizationHeader = true;
    }
  });
  await page.route(refreshEndpoint, async (route) => {
    refreshRequestCount += 1;
    await route.fulfill({ status: 500, json: {} });
  });

  await page.goto(`${callbackUrl}?access_token=${legacyToken}`);

  await expect(page.getByText(failureMessage)).toBeVisible();
  await expect(page).toHaveURL('/auth/signin');
  expect(
    await page.evaluate(() => localStorage.getItem('isLoggedIn'))
  ).toBeNull();
  expect(refreshRequestCount).toBe(0);
  expect(leakedAuthorizationHeader).toBe(false);
});
