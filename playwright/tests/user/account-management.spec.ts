import type {
  IAccountingEntity,
  IAccountingEntitySwitchReq,
  IUserPreferences,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  alternateAccountingEntity,
  authenticatedAccountingEntity,
  authenticatedUser,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

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

async function openHostPage(page: Page) {
  await registerAccountManagementRoutes(page);

  await page.goto('/dashboard');
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
  await page.setViewportSize({ width: 375, height: 900 });
  await openHostPage(page);

  const trigger = page.getByRole('button', {
    name: 'Open account management for Integration Entity',
  });

  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Account management' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Integration Entity');
  await expect(
    dialog.getByRole('button', { name: 'Switch to Drimsheet' })
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test('applies the selected account-menu theme to the host page', async ({
  page,
}) => {
  await openHostPage(page);

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

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('switches accounting entity and reloads with the active entity', async ({
  page,
}) => {
  await openHostPage(page);
  let attempts = 0;
  await page.route(switchEntityEndpoint, async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 400,
        json: {
          name: 'AccountingError',
          errorKey: 'accounting_error_accounting_entity_access_forbidden',
          validationErrors: [],
        },
      });

      return;
    }

    await route.fallback();
  });

  await page
    .getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
    .click();

  await test.step('A rejected switch keeps the current entity', async () => {
    await page.getByRole('button', { name: 'Switch to Drimsheet' }).click();
    await expect(
      page.getByText('Accounting entity access denied.')
    ).toBeVisible();
    await page.keyboard.press('Escape');

    const trigger = page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    });

    await expect(trigger).toBeVisible();
    await trigger.click();
  });

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
  await reloadRequestPromise;
  await activeEntityRequestPromise;

  await expect(
    page.getByRole('button', {
      name: 'Open account management for Drimsheet',
    })
  ).toBeVisible();
});
