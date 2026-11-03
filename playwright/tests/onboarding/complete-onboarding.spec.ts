import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

test.use({ authenticated: true });

test('coordinates final-step controls while saving and keeps the failed setup visible', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z'));
  await page.route('**/api/v1/currencies', (route) =>
    route.fulfill({
      json: [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
      ],
    })
  );
  await page.route('**/api/v1/accounting/jurisdictions', (route) =>
    route.fulfill({
      json: [
        {
          code: 'NG',
          name: 'Nigeria',
          currencyCode: 'NGN',
          maxFiscalMonths: 23,
          accountingStandards: {
            individual: ['IFRS'],
            sole_trader: [],
            private_company: [],
          },
        },
      ],
    })
  );
  let release!: () => void;

  const response = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/api/v1/users/preferences', async (route) => {
    await response;
    await route.fulfill({
      status: 422,
      json: {
        errorKey: 'app_error_user_preferences_app_theme_invalid',
        validationErrors: [],
      },
    });
  });
  await page.goto('/onboarding');
  await page.getByRole('radio', { name: 'Individual', exact: true }).click();
  await page.getByRole('combobox', { name: 'Country of residence' }).click();
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await page
    .getByRole('button', { name: 'Continue to reports', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await page
    .getByRole('button', { name: 'Continue to expense categories' })
    .click();

  const finish = page.getByRole('button', { name: 'Finish setup' });

  const selection = page.getByRole('checkbox', {
    name: 'Interest (Default)',
    exact: true,
  });

  await expect(selection).toBeChecked();
  await finish.click();
  await expect(finish).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Back', exact: true })
  ).toBeDisabled();
  await expect(selection).toBeDisabled();

  release();
  await expect(
    page.getByText('Invalid theme option.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Choose your expense categories' })
  ).toBeVisible();
  await expect(selection).toBeChecked();
  await expect(finish).toBeDisabled();
});
