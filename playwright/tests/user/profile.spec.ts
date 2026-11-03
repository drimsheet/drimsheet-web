import type {
  IUserPreferences,
  IUserPreferencesUpdateDto,
  IUserProfileUpdateDto,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  alternateAccountingEntity,
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';

test.use({ authenticated: true });

const preferencesEndpoint = '**/api/v1/users/preferences';
const profileEndpoint = '**/api/v1/users/profile';

const preferences: IUserPreferences = {
  userId: authenticatedUser.id,
  createdBy: authenticatedUser.id,
  lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
  appPreferences: { theme: 'light', appUsageMode: 'non_power_user' },
  createdAt: authenticatedUser.createdAt,
  updatedAt: authenticatedUser.updatedAt,
};

test.beforeEach(async ({ page }) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/accounting/accounting-entities', (route) =>
    route.fulfill({
      json: [authenticatedAccountingEntity, alternateAccountingEntity],
    })
  );
  await page.route(preferencesEndpoint, (route) =>
    route.fulfill({ json: preferences })
  );
  await page.addInitScript(() => {
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'light');
    }
  });
});

test('composes profile details, managed entities, and preferences', async ({
  page,
}) => {
  await page.goto('/profile');
  await expect(
    page.getByRole('heading', { name: 'Profile', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Profile', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  const details = page.getByRole('region', { name: 'Details', exact: true });
  await expect(details).toContainText('Integration User');
  const entities = page.getByRole('region', { name: 'Legal entities' });
  await expect(entities).toContainText('2 entities');
  await expect(entities).toContainText('Drimsheet');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('region', { name: 'Preferences', exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test('applies the saved system preference to the document across media changes and reload', async ({
  page,
}) => {
  let savedPreferences = structuredClone(preferences);
  await page.route(preferencesEndpoint, async (route) => {
    if (route.request().method() === 'PATCH') {
      const update = route
        .request()
        .postDataJSON() as IUserPreferencesUpdateDto;

      savedPreferences = {
        ...savedPreferences,
        appPreferences: { ...savedPreferences.appPreferences, ...update },
      };
    }

    await route.fulfill({ json: savedPreferences });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/profile');
  await page.getByRole('radio', { name: 'System', exact: true }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(
    page.getByRole('radio', { name: 'System', exact: true })
  ).toBeChecked();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('rolls back a failed preference without changing the document theme', async ({
  page,
}) => {
  await page.route(preferencesEndpoint, (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill({
          status: 400,
          json: { errorKey: 'app_error_user_preferences_app_theme_invalid' },
        })
      : route.fulfill({ json: preferences })
  );
  await page.goto('/profile');
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Your preferences could not be saved.'
  );
  await expect(
    page.getByRole('radio', { name: 'Light', exact: true })
  ).toBeChecked();
  await expect(
    page.getByRole('radio', { name: 'Dark', exact: true })
  ).toBeEnabled();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('keeps profile details visible when preferences fail and recovers after refresh', async ({
  page,
}) => {
  await page.route(preferencesEndpoint, (route) =>
    route.fulfill({ status: 400, json: {} })
  );
  await page.goto('/profile');
  await expect(page.getByRole('alert')).toContainText(
    'We could not load Preferences.'
  );
  await expect(
    page.getByRole('region', { name: 'Details', exact: true })
  ).toContainText(authenticatedUser.email);
  await page.route(preferencesEndpoint, (route) =>
    route.fulfill({ json: preferences })
  );
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('radio', { name: 'Light', exact: true })
  ).toBeChecked();
});

test('protects the pending profile dialog and refreshes host details after saving', async ({
  page,
}) => {
  let savedProfile = structuredClone(authenticatedUser);
  let finishSave: () => void = () => {};

  const saveGate = new Promise<void>((resolve) => {
    finishSave = resolve;
  });

  await page.route(profileEndpoint, async (route) => {
    if (route.request().method() === 'PATCH') {
      const update = route.request().postDataJSON() as IUserProfileUpdateDto;
      await saveGate;
      savedProfile = {
        ...savedProfile,
        ...update,
        updatedAt: '2026-10-16T10:00:00Z',
      };
    }

    await route.fulfill({ json: savedProfile });
  });
  await page.goto('/profile');
  const edit = page.getByRole('button', { name: 'Edit', exact: true });
  await edit.click();
  const dialog = page.getByRole('dialog', { name: 'Edit profile' });
  await expect(dialog.getByLabel('First name')).toBeFocused();
  await expect(dialog.getByLabel('First name')).toHaveValue('Integration');
  await expect(
    dialog.getByRole('button', { name: 'Save changes' })
  ).toBeDisabled();
  await dialog.getByLabel('First name').fill('  Ada  ');
  await dialog.getByLabel('Last name').fill('Okafor');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    dialog.getByRole('button', { name: 'Save changes' })
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    dialog.getByRole('button', { name: 'Save changes' })
  ).toBeDisabled();
  await expect(dialog.getByLabel('First name')).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  finishSave();
  await expect(dialog).not.toBeVisible();
  await expect(edit).toBeFocused();
  const details = page.getByRole('region', { name: 'Details', exact: true });
  await expect(details).toContainText('Ada Okafor');
  await expect(details).toContainText('AO');
});

test('keeps the profile dialog editable after a failed save without changing host details', async ({
  page,
}) => {
  await page.route(profileEndpoint, (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill({
          status: 400,
          json: { errorKey: 'user_error_first_name_invalid' },
        })
      : route.fulfill({ json: authenticatedUser })
  );
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit profile' });
  await dialog.getByLabel('First name').fill('Ada');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByRole('alert')).toContainText(
    'Your profile could not be saved.'
  );
  await expect(
    dialog.getByRole('button', { name: 'Save changes' })
  ).toBeEnabled();
  await expect(dialog.getByLabel('First name')).toHaveValue('Ada');
  await expect(
    page.getByRole('region', {
      name: 'Details',
      exact: true,
      includeHidden: true,
    })
  ).toContainText('Integration User');
});
