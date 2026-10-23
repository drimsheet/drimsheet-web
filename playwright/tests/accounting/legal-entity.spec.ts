import type {
  IAccountingEntity,
  IAccountingEntityCreationDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  alternateAccountingEntity,
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const timestamp = '2026-01-01T00:00:00Z';

const entities: IAccountingEntity[] = [
  { ...alternateAccountingEntity, name: 'Amara Studio Ltd' },
  {
    ...alternateAccountingEntity,
    id: '00000000-0000-4000-8000-000000000004' as TEntityId,
    name: 'Amara Consulting',
    type: 'sole_trader',
    jurisdictionCode: 'GB',
    functionalCurrencyCode: 'GBP',
    status: 'archived',
  },
  authenticatedAccountingEntity,
];

const jurisdictions = [
  {
    code: 'NG',
    name: 'Nigeria',
    currencyCode: 'NGN',
    maxFiscalMonths: 23,
    accountingStandards: {
      individual: ['IFRS'],
      sole_trader: ['IFRS'],
      private_company: ['IFRS'],
    },
  },
];

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
];

async function fillCreationForm(page: Page) {
  await page.getByRole('button', { name: 'Add a new legal entity' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a new legal entity' });
  await dialog.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Company', exact: true }).click();
  await dialog.getByLabel('Name', { exact: true }).fill('New Studio Ltd');
  await dialog
    .getByRole('combobox', { name: 'Country of residence' })
    .fill('Nigeria');
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await expect(
    dialog.getByRole('combobox', { name: 'Official currency' })
  ).toHaveValue('Nigerian Naira');

  return dialog;
}

test.beforeEach(async ({ page }) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/accounting/accounting-entities', (route) =>
    route.fulfill({ json: entities })
  );
  await page.route('**/api/v1/accounting/jurisdictions', (route) =>
    route.fulfill({ json: jurisdictions })
  );
  await page.route('**/api/v1/currencies', (route) =>
    route.fulfill({ json: currencies })
  );
  await page.route('**/api/v1/users/preferences', (route) =>
    route.fulfill({
      json: {
        userId: authenticatedUser.id,
        createdBy: authenticatedUser.id,
        lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
        appPreferences: { theme: 'light', appUsageMode: 'non_power_user' },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })
  );
  await page.route('**/api/v1/auth/refresh-access-token', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
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
  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
});

test('lists all legal entities and their metadata without requesting contexts', async ({
  page,
}) => {
  const contextRequests: string[] = [];
  await page.route('**/api/v1/accounting/*-contexts', async (route) => {
    contextRequests.push(route.request().url());
    await route.fulfill({ json: [] });
  });
  await page.getByRole('link', { name: 'Legal Entities', exact: true }).click();
  await expect(page).toHaveURL('/legal-entity');
  await expect(
    page.getByRole('link', { name: 'Legal Entities', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('heading', { name: 'Legal entities', exact: true })
  ).toBeVisible();
  const list = page.getByRole('list', { name: 'Your accounting entities' });
  await expect(list.getByRole('listitem')).toHaveCount(3);
  await expect(
    list.getByRole('heading', { name: 'Amara Studio Ltd' })
  ).toBeVisible();
  await expect(list.getByText('Private company')).toBeVisible();

  const soleTrader = list
    .getByRole('listitem')
    .filter({ hasText: 'Amara Consulting' });

  await expect(soleTrader).toContainText('Sole trader');
  await expect(soleTrader).toContainText('United Kingdom');
  await expect(soleTrader).toContainText('GBP');
  await expect(soleTrader).toContainText('Archived');
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.reload();
  await expect(list.getByRole('listitem')).toHaveCount(3);
  expect(contextRequests).toEqual([]);
});

test('creates an entity, prevents dismissal while saving, and updates the list without switching', async ({
  page,
}) => {
  let saved = false;
  let payload: IAccountingEntityCreationDto | undefined;
  let release!: () => void;

  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const created: IAccountingEntity = {
    ...alternateAccountingEntity,
    id: '00000000-0000-4000-8000-000000000009' as TEntityId,
    name: 'New Studio Ltd',
  };

  const switches: string[] = [];
  await page.route('**/api/v1/accounting/accounting-entity/switch', (route) => {
    switches.push(route.request().url());

    return route.fulfill({ json: created });
  });
  await page.route('**/api/v1/accounting/accounting-entities', (route) =>
    route.fulfill({ json: saved ? [...entities, created] : entities })
  );
  await page.route('**/api/v1/accounting/accounting-entity', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();

    payload = route.request().postDataJSON();
    await responseGate;
    saved = true;
    await route.fulfill({ json: created });
  });
  await page.getByRole('link', { name: 'Legal Entities', exact: true }).click();
  const dialog = await fillCreationForm(page);
  await dialog
    .getByRole('button', { name: 'Create legal entity', exact: true })
    .click();
  await expect(
    dialog.getByRole('button', { name: 'Create legal entity', exact: true })
  ).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  release();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'New Studio Ltd' })
  ).toBeVisible();
  await expect(
    page
      .getByRole('list', { name: 'Your accounting entities' })
      .getByRole('listitem')
  ).toHaveCount(4);
  await expect(
    page.getByRole('button', { name: 'Add a new legal entity' })
  ).toBeFocused();
  expect(payload).toEqual({
    name: 'New Studio Ltd',
    entityType: 'private_company',
    jurisdictionCode: 'NG',
    functionalCurrencyCode: 'NGN',
  });
  expect(switches).toEqual([]);
});

test('retains form input after a creation failure and resets on reopening', async ({
  page,
}) => {
  await page.route('**/api/v1/accounting/accounting-entity', (route) => {
    if (route.request().method() !== 'POST') return route.fallback();

    return route.fulfill({ status: 500, json: {} });
  });
  await page.getByRole('link', { name: 'Legal Entities', exact: true }).click();
  const dialog = await fillCreationForm(page);
  await dialog
    .getByRole('button', { name: 'Create legal entity', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText(
    'Your details have been kept'
  );
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    'New Studio Ltd'
  );
  await expect(
    dialog.getByRole('button', { name: 'Create legal entity', exact: true })
  ).toBeEnabled();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('button', { name: 'Add a new legal entity' })
  ).toBeFocused();
  await page.getByRole('button', { name: 'Add a new legal entity' }).click();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue('');
  await expect(dialog.getByRole('alert')).toHaveCount(0);
});

test('recovers from unavailable form options', async ({ page }) => {
  let fail = true;
  await page.route('**/api/v1/accounting/jurisdictions', (route) => {
    if (fail) return route.fulfill({ status: 500, json: {} });

    return route.fulfill({ json: jurisdictions });
  });
  await page.getByRole('link', { name: 'Legal Entities', exact: true }).click();
  await page.getByRole('button', { name: 'Add a new legal entity' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('alert')).toContainText(
    'We couldn’t load the countries and currencies'
  );
  await expect(
    dialog.getByRole('button', { name: 'Create legal entity', exact: true })
  ).toBeDisabled();
  fail = false;
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Add a new legal entity' }).click();
  await expect(dialog.getByLabel('Name', { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Create legal entity', exact: true })
  ).toBeEnabled();
});

test('keeps the last list when refresh fails and recovers after browser refresh', async ({
  page,
}) => {
  await page.route('**/api/v1/accounting/accounting-entities', (route) =>
    route.fulfill({ status: 500, json: {} })
  );
  await page.getByRole('link', { name: 'Legal Entities', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'The last available list is shown'
  );
  await expect(
    page
      .getByRole('list', { name: 'Your accounting entities' })
      .getByRole('listitem')
  ).toHaveCount(3);
  await page.route('**/api/v1/accounting/accounting-entities', (route) =>
    route.fulfill({ json: entities })
  );
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(
    page
      .getByRole('list', { name: 'Your accounting entities' })
      .getByRole('listitem')
  ).toHaveCount(3);
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [1024, 375]) {
    test(`keeps the list and creation action usable at ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.route('**/api/v1/users/preferences', (route) =>
        route.fulfill({
          json: {
            userId: authenticatedUser.id,
            createdBy: authenticatedUser.id,
            lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
            appPreferences: { theme, appUsageMode: 'non_power_user' },
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        })
      );
      await page.evaluate(
        (value) => localStorage.setItem('theme', value),
        theme
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/legal-entity');
      const list = page.getByRole('list', { name: 'Your accounting entities' });
      await expect(list.getByRole('listitem')).toHaveCount(3);
      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(26, 25, 25)'
      );
      await expect(
        page.getByRole('button', { name: 'Add a new legal entity' })
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath('legal-entities.png'),
        fullPage: true,
      });
      await page
        .getByRole('button', { name: 'Add a new legal entity' })
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel('Name', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(
        page.getByRole('button', { name: 'Add a new legal entity' })
      ).toBeFocused();
    });
  }
}

test('opens entity details from name links and keeps compact actions inactive', async ({
  page,
}) => {
  const entityWrites: string[] = [];
  await page.route('**/api/v1/accounting/accounting-entity', (route) =>
    route.fulfill({
      json:
        route.request().headers()['x-accounting-entity-id'] === entities[0].id
          ? entities[0]
          : authenticatedAccountingEntity,
    })
  );
  await page.route('**/api/v1/accounting/fiscal-years', (route) =>
    route.fulfill({ json: [] })
  );

  await page.route('**/api/v1/accounting/**', async (route) => {
    if (route.request().method() !== 'GET') {
      entityWrites.push(route.request().url());

      return route.fulfill({ status: 500, json: {} });
    }

    return route.fallback();
  });
  await page.goto('/legal-entity');
  const list = page.getByRole('list', { name: 'Your accounting entities' });
  const name = list.getByRole('link', { name: 'Amara Studio Ltd' });

  await expect(name).toHaveAttribute('href', `/legal-entity/${entities[0].id}`);
  await expect(name).toHaveCSS('text-decoration-line', 'none');
  await name.hover();
  await expect(name).toHaveCSS('text-decoration-line', 'none');
  await name.focus();
  await expect(name).toHaveCSS('text-decoration-line', 'none');
  await expect(name).toHaveCSS('outline-width', '2px');

  const trigger = list.getByRole('button', {
    name: 'Actions for Amara Studio Ltd',
  });

  await trigger.click();
  await expect(
    page.getByRole('menuitem', { name: 'Switch to entity' })
  ).toBeDisabled();
  await expect(
    page.getByRole('menuitem', { name: 'Edit entity' })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();

  const current = list
    .getByRole('listitem')
    .filter({ hasText: 'Integration Entity' });

  await expect(current.getByText('Current', { exact: true })).toBeVisible();
  await current
    .getByRole('button', { name: 'Actions for Integration Entity' })
    .click();
  await expect(page.getByRole('menuitem')).toHaveCount(1);
  await expect(
    page.getByRole('menuitem', { name: 'Edit entity' })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await name.click();
  await expect(page).toHaveURL(`/legal-entity/${entities[0].id}`);
  await expect(
    page.getByRole('heading', { name: 'Amara Studio Ltd' })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Amara Studio Ltd' })
  ).toBeVisible();
  expect(entityWrites).toEqual([]);
});
