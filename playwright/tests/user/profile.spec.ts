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
  await page.route('**/api/v1/auth/refresh-access-token', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.route(preferencesEndpoint, (route) =>
    route.fulfill({ json: preferences })
  );
  await page.route('**/api/v1/auth/login-with-email', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.addInitScript(() => {
    if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'light');
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
});

test('shows API profile details and managed entities, with working profile navigation', async ({
  page,
}, testInfo) => {
  await page.goto('/profile');
  await expect(
    page.getByRole('heading', { name: 'Profile', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Profile', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  const details = page.getByRole('region', { name: 'Details', exact: true });
  await expect(details).toContainText('Integration User');
  await expect(details).toContainText(authenticatedUser.email);
  await expect(details).toContainText('Email verified');
  const entities = page.getByRole('region', { name: 'Legal entities' });
  await expect(entities).toContainText('2 entities');
  await expect(entities).toContainText('Nigeria');
  await expect(entities).toContainText('NGN');
  await expect(entities).toContainText('Drimsheet');
  await expect(entities.getByText('Current', { exact: true })).toHaveCount(1);
  await page
    .getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
    .click();
  await page.getByRole('button', { name: 'Profile settings' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Account management' })
  ).not.toBeVisible();
  await expect(page).toHaveURL('/profile');
  await page.screenshot({
    path: testInfo.outputPath('profile-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('region', { name: 'Preferences', exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('profile-mobile.png'),
    fullPage: true,
  });
});

test('saves both preferences and follows the system theme across reloads', async ({
  page,
}, testInfo) => {
  const updates: IUserPreferencesUpdateDto[] = [];
  let savedPreferences = structuredClone(preferences);
  await page.route(preferencesEndpoint, async (route) => {
    if (route.request().method() === 'PATCH') {
      const update = route
        .request()
        .postDataJSON() as IUserPreferencesUpdateDto;

      updates.push(update);
      savedPreferences = {
        ...savedPreferences,
        appPreferences: { ...savedPreferences.appPreferences, ...update },
      };
    }

    await route.fulfill({ json: savedPreferences });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/profile');
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Preferences saved.');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('radio', { name: 'Manual', exact: true }).click();
  await expect(
    page.getByRole('radio', { name: 'Manual', exact: true })
  ).toBeChecked();
  await page.getByRole('radio', { name: 'System', exact: true }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(updates).toEqual([
    { theme: 'dark' },
    { appUsageMode: 'power_user' },
    { theme: 'system' },
  ]);
  await page.screenshot({
    path: testInfo.outputPath('profile-dark.png'),
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole('radio', { name: 'System', exact: true })
  ).toBeChecked();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(
    page.getByRole('radio', { name: 'Manual', exact: true })
  ).toBeChecked();
});

test('retains saved settings on failure and allows another attempt', async ({
  page,
}) => {
  let shouldFail = true;
  await page.route(preferencesEndpoint, async (route) => {
    if (route.request().method() === 'PATCH') {
      if (shouldFail) {
        await route.fulfill({
          status: 400,
          json: {
            name: 'ValidationError',
            errorKey: 'app_error_user_preferences_app_theme_invalid',
          },
        });

        return;
      }

      await route.fulfill({
        json: {
          ...preferences,
          appPreferences: { ...preferences.appPreferences, theme: 'dark' },
        },
      });

      return;
    }

    await route.fulfill({ json: preferences });
  });
  await page.goto('/profile');
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Your preferences could not be saved.'
  );
  await expect(
    page.getByRole('radio', { name: 'Light', exact: true })
  ).toBeChecked();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  shouldFail = false;
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  await expect(
    page.getByRole('radio', { name: 'Dark', exact: true })
  ).toBeChecked();
  await expect(page.getByRole('alert')).not.toBeVisible();
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

test('updates profile names and keeps the saved result on reopening and reload', async ({
  page,
}, testInfo) => {
  let savedProfile = structuredClone(authenticatedUser);
  const updates: IUserProfileUpdateDto[] = [];
  let finishSave: () => void = () => {};

  const saveGate = new Promise<void>((resolve) => {
    finishSave = resolve;
  });

  await page.route(profileEndpoint, async (route) => {
    if (route.request().method() === 'PATCH') {
      const update = route.request().postDataJSON() as IUserProfileUpdateDto;
      updates.push(update);
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
  await page.screenshot({
    path: testInfo.outputPath('profile-edit-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    dialog.getByRole('button', { name: 'Save changes' })
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('profile-edit-mobile.png'),
    fullPage: true,
  });
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
  await expect(details).toContainText(authenticatedUser.email);
  expect(updates).toEqual([{ firstName: 'Ada', lastName: 'Okafor' }]);
  await edit.click();
  await expect(dialog.getByLabel('First name')).toHaveValue('Ada');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await page.reload();
  await expect(details).toContainText('Ada Okafor');
});

test('retains profile edits after a failed save and retries successfully', async ({
  page,
}) => {
  let shouldFail = true;
  await page.route(profileEndpoint, async (route) => {
    if (route.request().method() !== 'PATCH') {
      await route.fulfill({ json: authenticatedUser });

      return;
    }

    if (shouldFail) {
      await route.fulfill({
        status: 400,
        json: { errorKey: 'user_error_first_name_invalid' },
      });

      return;
    }

    await route.fulfill({
      json: { ...authenticatedUser, ...route.request().postDataJSON() },
    });
  });
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit profile' });
  await dialog.getByLabel('First name').fill('Ada');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByRole('alert')).toContainText(
    'Your profile could not be saved.'
  );
  await expect(dialog.getByLabel('First name')).toHaveValue('Ada');
  await expect(
    page.getByText('Integration User', { exact: true })
  ).toBeVisible();
  shouldFail = false;
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Details', exact: true })
  ).toContainText('Ada User');
});

test('discards cancelled edits and resets the form when reopened', async ({
  page,
}) => {
  const updates: unknown[] = [];
  await page.route(profileEndpoint, async (route) => {
    if (route.request().method() === 'PATCH')
      updates.push(route.request().postDataJSON());

    await route.fulfill({ json: authenticatedUser });
  });
  await page.goto('/profile');
  const edit = page.getByRole('button', { name: 'Edit', exact: true });
  await edit.click();
  const dialog = page.getByRole('dialog', { name: 'Edit profile' });
  await dialog.getByLabel('First name').fill('Unsaved');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(edit).toBeFocused();
  await edit.click();
  await expect(dialog.getByLabel('First name')).toHaveValue('Integration');
  await dialog.getByLabel('First name').fill('');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByText('Enter your first name.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await edit.click();
  await expect(dialog.getByLabel('First name')).toHaveValue('Integration');
  await expect(dialog.getByText('Enter your first name.')).not.toBeVisible();
  expect(updates).toEqual([]);
});
