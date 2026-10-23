import { expect, test } from '@integration/fixtures/test';

const signupEndpoint = '**/api/v1/auth/signup-with-email';

const validUserData = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  password: 'Password1!',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/auth/signup');
});

test('creates an account after a settled failure, ignoring untrusted success hints', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  let attempts = 0;
  await page.route(signupEndpoint, async (route) => {
    attempts++;
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual(validUserData);
    await route.fulfill(
      attempts === 1
        ? {
            status: 400,
            json: {
              name: 'ConflictError',
              errorKey: 'auth_error_inconsistent_user_auth_unexpected',
              validationErrors: [],
            },
          }
        : { json: {} }
    );
  });
  await test.step('Untrusted hints do not bypass the signup form', async () => {
    await page.goto('/auth/signup?success=true');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Create account' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Account created successfully!',
      })
    ).not.toBeVisible();
  });
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create account' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue with Google' })
  ).toBeVisible();
  await test.step('Fields remain usable at mobile width', async () => {
    const firstName = page.getByLabel('First name');
    const lastName = page.getByLabel('Last name');
    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password', { exact: true });
    const submit = page.getByRole('button', { name: 'Create account' });

    for (const control of [firstName, lastName, email, password, submit]) {
      await control.scrollIntoViewIfNeeded();
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
    }

    const firstNameBox = await firstName.boundingBox();
    const lastNameBox = await lastName.boundingBox();

    expect(lastNameBox?.y).toBeGreaterThan(
      (firstNameBox?.y ?? 0) + (firstNameBox?.height ?? 0)
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await expect(
      page.getByText('By creating an account, you agree to our')
    ).toBeVisible();
  });
  await test.step('Failure settles and preserves all inputs', async () => {
    await page.getByLabel('First name').fill(validUserData.firstName);
    await page.getByLabel('Last name').fill(validUserData.lastName);
    await page.getByLabel('Email').fill(validUserData.email);
    await page
      .getByLabel('Password', { exact: true })
      .fill(validUserData.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(
      page.getByText('Unable to verify your account.')
    ).toBeVisible();
    await expect(page).toHaveURL('/auth/signup?success=true');
    await expect(page.getByLabel('First name')).toHaveValue(
      validUserData.firstName
    );
    await expect(page.getByLabel('Last name')).toHaveValue(
      validUserData.lastName
    );
    await expect(page.getByLabel('Email')).toHaveValue(validUserData.email);
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue(
      validUserData.password
    );
    await expect(
      page.getByRole('button', { name: 'Create account' })
    ).toBeEnabled();
  });
  await test.step('Explicit submission completes signup', async () => {
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL('/auth/signup?success=true');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Account created successfully!',
      })
    ).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(
      'Please check your email for a verification link'
    );
    expect(attempts).toBe(2);
  });
});
