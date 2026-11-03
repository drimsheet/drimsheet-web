import { expect, test } from '@integration/fixtures/test';
import type { Page } from '@playwright/test';

const signupEndpoint = '**/api/v1/auth/signup-with-email';

async function fillSignupForm(page: Page) {
  await page.getByLabel('First name').fill('Jane');
  await page.getByLabel('Last name').fill('Doe');
  await page.getByLabel('Email').fill('jane.doe@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
}

test('keeps the signup form and its draft after a settled failure', async ({
  page,
}) => {
  await page.route(signupEndpoint, (route) =>
    route.fulfill({
      status: 400,
      json: {
        name: 'ConflictError',
        errorKey: 'auth_error_inconsistent_user_auth_unexpected',
        validationErrors: [],
      },
    })
  );
  await page.goto('/auth/signup');
  await fillSignupForm(page);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Unable to verify your account.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create account' })
  ).toBeEnabled();
  await expect(page.getByLabel('Email')).toHaveValue('jane.doe@example.com');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue(
    'Password1!'
  );
  await expect(
    page.getByRole('heading', { name: 'Account created successfully!' })
  ).not.toBeVisible();
});

test('ignores a URL success hint until signup replaces the form with confirmation', async ({
  page,
}) => {
  await page.route(signupEndpoint, (route) => route.fulfill({ json: {} }));
  await page.goto('/auth/signup?success=true');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create account' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Account created successfully!' })
  ).not.toBeVisible();
  await fillSignupForm(page);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Account created successfully!',
    })
  ).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(
    'Please check your email for a verification link'
  );
  await expect(page.getByLabel('Email')).not.toBeVisible();
});
