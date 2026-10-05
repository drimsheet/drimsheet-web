import { expect, test } from '@integration/fixtures/test';

const resetEndpoint = '**/api/v1/auth/get-password-reset-link';

function createResponseGate() {
  let resolve = () => {};

  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

test('renders main landmark, level-one heading, and exact brand link', async ({
  page,
}) => {
  await page.goto('/auth/forgot-password');

  const main = page.getByRole('main');
  await expect(main).toBeVisible();

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveText('Reset your password');

  const brandLink = page.getByRole('link', { name: 'Drimsheet' });
  await expect(brandLink).toBeVisible();
  await expect(brandLink).toHaveAttribute('href', '/');
});

test('associates validation errors with input via aria-invalid and aria-describedby', async ({
  page,
}) => {
  await page.goto('/auth/forgot-password');

  const emailInput = page.getByLabel('Email');
  await page.getByRole('button', { name: 'Get password reset link' }).click();

  const requiredError = page.getByText('Email is required');
  await expect(requiredError).toBeVisible();
  await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  const errorId = await requiredError.getAttribute('id');
  expect(errorId).toBeTruthy();
  await expect(emailInput).toHaveAttribute('aria-describedby', errorId!);

  await emailInput.fill('invalid-email');
  await page.getByRole('button', { name: 'Get password reset link' }).click();

  const formatError = page.getByText('Enter a valid email');
  await expect(formatError).toBeVisible();
  await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
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
      json: { message: 'Password reset link sent' },
    });
  });

  await page.goto('/auth/forgot-password');

  const emailInput = page.getByLabel('Email');
  await emailInput.fill('user@example.com');

  const submitButton = page.getByRole('button', {
    name: 'Get password reset link',
  });

  await submitButton.click();

  await emailInput.press('Enter');
  await submitButton.click({ force: true }).catch(() => {});

  await expect(emailInput).toBeDisabled();
  await expect(submitButton).toBeDisabled();

  responseGate.resolve();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );
  expect(requestCount).toBe(1);
  expect(postData).toEqual({ email: 'user@example.com' });
});

test('fulfills initial request and shows persistent success view without leaking account details', async ({
  page,
}) => {
  await page.route(resetEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { message: 'Password reset link sent' },
    });
  });

  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Get password reset link' }).click();

  await expect(page).toHaveURL('/auth/forgot-password');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );

  const statusRegion = page.getByRole('status');
  await expect(statusRegion).toBeVisible();
  await expect(statusRegion).toHaveText(
    'A password reset link was sent to your email.'
  );

  await expect(page.getByLabel('Email')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Retry in/i })).toBeVisible();
});

test('retains email and form when initial request fails', async ({ page }) => {
  await page.route(resetEndpoint, async (route) => {
    await route.fulfill({
      status: 500,
      json: {
        name: 'InternalServerError',
        errorKey: 'internal_server_error',
        validationErrors: [],
      },
    });
  });

  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Get password reset link' }).click();

  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Reset your password'
  );
});

test('advances cooldown, resends request, and keeps success view while pending', async ({
  page,
}) => {
  let requestCount = 0;
  const responseGate = createResponseGate();

  await page.clock.install();

  await page.route(resetEndpoint, async (route) => {
    requestCount += 1;
    if (requestCount === 2) {
      await responseGate.promise;
    }

    await route.fulfill({
      status: 200,
      json: { message: 'Password reset link sent' },
    });
  });

  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Get password reset link' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );

  const countdownButton = page.getByRole('button', { name: /Retry in 30s/i });
  await expect(countdownButton).toBeVisible();

  for (let i = 0; i < 30; i += 1) {
    await page.clock.fastForward(1000);
  }

  const retryButton = page.getByRole('button', { name: 'Retry' });
  await expect(retryButton).toBeEnabled();

  await retryButton.click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );

  responseGate.resolve();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );
  expect(requestCount).toBe(2);
});

test('retains success view on resend API failure', async ({ page }) => {
  let requestCount = 0;

  await page.clock.install();

  await page.route(resetEndpoint, async (route) => {
    requestCount += 1;
    if (requestCount === 2) {
      await route.fulfill({
        status: 500,
        json: {
          name: 'InternalServerError',
          errorKey: 'internal_server_error',
          validationErrors: [],
        },
      });

      return;
    }

    await route.fulfill({
      status: 200,
      json: { message: 'Password reset link sent' },
    });
  });

  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Get password reset link' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );

  const countdownButton = page.getByRole('button', { name: /Retry in 30s/i });
  await expect(countdownButton).toBeVisible();

  for (let i = 0; i < 30; i += 1) {
    await page.clock.fastForward(1000);
  }

  await page.getByRole('button', { name: 'Retry' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );
  expect(requestCount).toBe(2);
});

test('navigates to /auth/signin when Back to sign in is clicked', async ({
  page,
}) => {
  await page.goto('/auth/forgot-password');

  await page.getByRole('link', { name: 'Back to sign in' }).click();
  await expect(page).toHaveURL('/auth/signin');
});

test('reflows at 320px viewport without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/auth/forgot-password');

  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  );

  expect(scrollWidth).toBeLessThanOrEqual(320);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Get password reset link' })
  ).toBeVisible();
});
