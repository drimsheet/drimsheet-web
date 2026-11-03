import { expect, test } from '@integration/fixtures/test';

test('coordinates pending controls and retains credentials after rejection', async ({
  page,
}) => {
  let release!: () => void;

  const response = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/api/v1/auth/login-with-email', async (route) => {
    await response;
    await route.fulfill({
      status: 401,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_credentials_invalid_unauthorized',
        validationErrors: [],
      },
    });
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password', { exact: true }).fill('WrongPassword1!');
  const submit = page.getByRole('button', { name: 'Sign In', exact: true });
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
  release();
  await expect(page.getByText('Invalid email or password.')).toBeVisible();
  await expect(submit).toBeEnabled();
  await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue(
    'WrongPassword1!'
  );
});
