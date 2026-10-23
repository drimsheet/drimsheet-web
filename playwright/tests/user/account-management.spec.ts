import type {
  IAccountingEntity,
  IAccountingEntitySwitchReq,
  IUserPreferences,
  IUserPreferencesUpdateDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  alternateAccountingEntity,
  authenticatedAccountingEntity,
  authenticatedUser,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const profileEndpoint = '**/api/v1/users/profile';
const entityListEndpoint = '**/api/v1/accounting/accounting-entities';
const activeEntityEndpoint = '**/api/v1/accounting/accounting-entity';
const switchEntityEndpoint = '**/api/v1/accounting/accounting-entity/switch';
const preferencesEndpoint = '**/api/v1/users/preferences';

async function registerAccountManagementRoutes(page: Page) {
  const accountingEntities: IAccountingEntity[] = [
    authenticatedAccountingEntity,
    alternateAccountingEntity,
  ];

  await page.route(profileEndpoint, async (route) => {
    await route.fulfill({ json: authenticatedUser });
  });
  await page.route(entityListEndpoint, async (route) => {
    await route.fulfill({ json: accountingEntities });
  });
  await page.route(activeEntityEndpoint, async (route) => {
    const accountingEntityId = route.request().headers()[
      'x-accounting-entity-id'
    ];

    const activeAccountingEntity = accountingEntities.find(
      ({ id }) => id === accountingEntityId
    );

    if (!activeAccountingEntity) {
      await route.fulfill({ status: 404 });

      return;
    }

    await route.fulfill({ json: activeAccountingEntity });
  });
  await page.route(switchEntityEndpoint, async (route) => {
    const payload = route
      .request()
      .postDataJSON() as IAccountingEntitySwitchReq;

    const activeAccountingEntity = accountingEntities.find(
      ({ id }) => id === payload.accountingEntityId
    );

    await route.fulfill({ json: activeAccountingEntity });
  });
}

async function signIn(page: Page) {
  await registerAccountManagementRoutes(page);
  await page.route(refreshEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });
  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await page
      .getByRole('button', { name: 'Toggle Sidebar', exact: true })
      .click();
  }

  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
}

test('opens account management with active and alternate account details', async ({
  page,
}) => {
  await signIn(page);

  const trigger = page.getByRole('button', {
    name: 'Open account management for Integration Entity',
  });

  await expect(trigger).toContainText('IE');
  await expect(
    page.getByRole('button', { name: 'Notifications' })
  ).toBeDisabled();

  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Account management' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Integration Entity');
  await expect(dialog).toContainText(authenticatedUser.email);
  await expect(dialog).toContainText('Individual');
  await expect(
    dialog.getByRole('button', { name: 'Switch to Drimsheet' })
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Drop a feedback' })
  ).toBeDisabled();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('persists a selected color theme preference', async ({ page }) => {
  await signIn(page);

  const updatedPreferences = {
    createdBy: authenticatedUser.id,
    userId: authenticatedUser.id as TEntityId,
    lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
    appPreferences: {
      theme: 'light',
      appUsageMode: 'power_user',
    },
    createdAt: authenticatedUser.createdAt,
    updatedAt: authenticatedUser.updatedAt,
  } satisfies IUserPreferences;

  await page.route(preferencesEndpoint, async (route) => {
    await route.fulfill({ json: updatedPreferences });
  });

  await page
    .getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
    .click();

  const preferencesRequestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/v1/users/preferences') &&
      request.method() === 'PATCH'
  );

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  const preferencesRequest = await preferencesRequestPromise;

  expect(
    preferencesRequest.postDataJSON() as IUserPreferencesUpdateDto
  ).toEqual({ theme: 'light' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('theme')))
    .toBe('light');
});

test('switches accounting entity and reloads with the active entity', async ({
  page,
}) => {
  await signIn(page);

  await page
    .getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
    .click();

  const switchRequestPromise = page.waitForRequest(switchEntityEndpoint);

  const reloadRequestPromise = page.waitForRequest(
    (request) =>
      request.isNavigationRequest() &&
      request.url() === 'http://127.0.0.1:4000/dashboard'
  );

  const activeEntityRequestPromise = page.waitForRequest(
    (request) =>
      request.url().includes('/api/v1/accounting/accounting-entity') &&
      request.method() === 'GET' &&
      request.headers()['x-accounting-entity-id'] ===
        alternateAccountingEntity.id
  );

  await page.getByRole('button', { name: 'Switch to Drimsheet' }).click();
  const switchRequest = await switchRequestPromise;
  await reloadRequestPromise;
  await activeEntityRequestPromise;

  expect(switchRequest.postDataJSON()).toEqual({
    accountingEntityId: alternateAccountingEntity.id,
  });

  await expect(
    page.getByRole('button', {
      name: 'Open account management for Drimsheet',
    })
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('accounting-entity-id'))
  ).toBeNull();
});

test('keeps the current entity when switching fails', async ({ page }) => {
  await signIn(page);
  await page.route(switchEntityEndpoint, async (route) => {
    await route.fulfill({
      status: 400,
      json: {
        name: 'AccountingError',
        errorKey: 'accounting_error_accounting_entity_access_forbidden',
        validationErrors: [],
      },
    });
  });

  await page
    .getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
    .click();
  await page.getByRole('button', { name: 'Switch to Drimsheet' }).click();

  await expect(
    page.getByText('Accounting entity access denied.')
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [1280, 375]) {
    test(`keeps sidebar account controls accessible in ${theme} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (appearance) => localStorage.setItem('theme', appearance),
        theme
      );
      await signIn(page);
      await expect(page.getByRole('banner')).toHaveCount(0);
      await expect(
        page.getByRole('navigation', { name: 'breadcrumb' })
      ).toHaveCount(0);
      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(26, 25, 25)'
      );

      const trigger = page.getByRole('button', {
        name: 'Open account management for Integration Entity',
      });

      await expect(trigger).toBeInViewport();
      await expect(trigger).toContainText('Integration Entity');
      await page.screenshot({
        path: testInfo.outputPath('sidebar.png'),
        animations: 'disabled',
      });
      if (width > 768) {
        await page
          .getByRole('button', { name: 'Toggle sidebar', exact: true })
          .first()
          .click();
        await expect(trigger).toBeInViewport();
      }

      await trigger.click();
      const menu = page.getByRole('dialog', { name: 'Account management' });
      await expect(menu).toBeVisible();
      await expect(
        menu.getByRole('button', { name: 'Log out' })
      ).toBeInViewport();
      await expect(
        menu.getByRole('button', { name: 'Switch to Drimsheet' })
      ).toBeInViewport();
      await page.screenshot({
        path: testInfo.outputPath('account-menu.png'),
        animations: 'disabled',
      });
      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();
      await expect(trigger).toBeFocused();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);
    });
  }
}
