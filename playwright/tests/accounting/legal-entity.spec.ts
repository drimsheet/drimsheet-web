import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  alternateAccountingEntity,
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

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
  await dialog
    .getByRole('radio', { name: 'Private company', exact: true })
    .click();
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
  await page.addInitScript(() => {
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'light');
    }
  });
});

test('lists all legal entities and their metadata without requesting contexts', async ({
  page,
}) => {
  const contextRequests: string[] = [];
  await page.route('**/api/v1/accounting/*-contexts', async (route) => {
    contextRequests.push(route.request().url());
    await route.fulfill({ json: [] });
  });
  await page.goto('/legal-entity');
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
  await page.setViewportSize({ width: 375, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test('creates an entity, prevents dismissal while saving, and updates the list without switching', async ({
  page,
}) => {
  let saved = false;
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
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }

    await responseGate;
    saved = true;
    await route.fulfill({ json: created });
  });
  await page.goto('/legal-entity');
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
  expect(switches).toEqual([]);
});

test('retains the legal-entity draft when creation fails', async ({ page }) => {
  await page.route('**/api/v1/accounting/accounting-entity', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 500, json: {} })
      : route.fallback()
  );
  await page.goto('/legal-entity');
  const dialog = await fillCreationForm(page);
  await dialog
    .getByRole('button', { name: 'Create legal entity', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText(
    'Your details have been kept'
  );
  await expect(
    dialog.getByRole('button', { name: 'Create legal entity', exact: true })
  ).toBeEnabled();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    'New Studio Ltd'
  );
  await expect(
    page
      .getByRole('list', {
        name: 'Your accounting entities',
        includeHidden: true,
      })
      .getByRole('listitem', { includeHidden: true })
  ).toHaveCount(3);
});

test('recovers from unavailable form options', async ({ page }) => {
  let fail = true;
  await page.route('**/api/v1/accounting/jurisdictions', (route) => {
    if (fail) {
      return route.fulfill({ status: 500, json: {} });
    }

    return route.fulfill({ json: jurisdictions });
  });
  await page.goto('/legal-entity');
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
