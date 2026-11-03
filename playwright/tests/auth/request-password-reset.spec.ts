import { expect, test } from '@integration/fixtures/test';

const resetEndpoint = '**/api/v1/auth/get-password-reset-link';

test('retains the email after a reset-link request fails', async ({ page }) => {
  await page.route(resetEndpoint, (route) =>
    route.fulfill({
      status: 400,
      json: {
        name: 'BadRequestError',
        errorKey: 'auth_error_token_invalid_unauthorized',
        validationErrors: [],
      },
    })
  );
  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email').fill('user@example.com');
  const submit = page.getByRole('button', { name: 'Get password reset link' });
  await submit.click();
  await expect(page.getByText('Invalid token.')).toBeVisible();
  await expect(submit).toBeEnabled();
  await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
});

test('replaces the pending reset form with the email-sent state', async ({
  page,
}) => {
  let finishRequest!: () => void;

  const response = new Promise<void>((resolve) => {
    finishRequest = resolve;
  });

  await page.route(resetEndpoint, async (route) => {
    await response;
    await route.fulfill({ json: { message: 'Password reset link sent' } });
  });
  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email').fill('user@example.com');
  const submit = page.getByRole('button', { name: 'Get password reset link' });
  await submit.click();
  await expect(page.getByLabel('Email')).toBeDisabled();
  await expect(submit).toBeDisabled();
  finishRequest();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Email Sent'
  );
  await expect(page.getByRole('status')).toHaveText(
    'A password reset link was sent to your email.'
  );
  await expect(page.getByLabel('Email')).not.toBeVisible();
});
