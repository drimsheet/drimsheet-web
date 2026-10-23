import { expect, test } from '@integration/fixtures/test';

const resetEndpoint = '**/api/v1/auth/get-password-reset-link';

function createResponseGate() {
  let resolve = () => {};

  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

test('retains a failed reset request, then sends once and shows success', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });

  const responseGate = createResponseGate();
  let requestCount = 0;
  let postData: unknown = null;

  await page.route(resetEndpoint, async (route) => {
    expect(route.request().method()).toBe('POST');
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
      json: { message: 'Password reset link sent' },
    });
  });

  await page.goto('/auth/forgot-password');

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Reset your password'
  );
  const brandLink = page.getByRole('link', { name: 'Drimsheet', exact: true });
  await expect(brandLink).toBeVisible();
  await expect(brandLink).toHaveAttribute('href', '/');

  const emailInput = page.getByLabel('Email');
  await emailInput.fill('user@example.com');

  const submitButton = page.getByRole('button', {
    name: 'Get password reset link',
  });

  await test.step('Failure handling settles before input retention is checked', async () => {
    await submitButton.click();
    await expect(page.getByText('Invalid token.')).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await expect(emailInput).toHaveValue('user@example.com');
  });
  await test.step('Narrow form submits only once while pending', async () => {
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
      .toBe(true);
    await submitButton.click();

    await emailInput.press('Enter');
    await submitButton.click({ force: true }).catch(() => {});

    await expect(emailInput).toBeDisabled();
    await expect(submitButton).toBeDisabled();

    responseGate.resolve();
  });
  await test.step('Submission completes successfully', async () => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Email Sent'
    );
    expect(requestCount).toBe(2);
    expect(postData).toEqual({ email: 'user@example.com' });
    await expect(page).toHaveURL('/auth/forgot-password');
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(
      'A password reset link was sent to your email.'
    );
    await expect(emailInput).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /retry|resend/i })
    ).toHaveCount(0);
    await page.getByRole('link', { name: 'Back to sign in' }).click();
    await expect(page).toHaveURL('/auth/signin');
  });
});
