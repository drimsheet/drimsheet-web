import type {
  IAccountingEntity,
  IAccountingEntityUpdateReq,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import {
  context,
  entity,
  now,
  year,
} from '@integration/mocks/legal-entity-details';

const previousYear = {
  ...year,
  id: 'previous-year',
  name: 'FY 2025',
  startDate: '2025-01-01T00:00:00Z',
  endDate: '2025-12-31T00:00:00Z',
  status: 'closed',
};

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(now);
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/accounting/accounting-entities', (route) =>
    route.fulfill({ json: [authenticatedAccountingEntity, entity] })
  );
  await page.route('**/api/v1/accounting/accounting-entity', (route) =>
    route.fulfill({
      json:
        route.request().headers()['x-accounting-entity-id'] === entity.id
          ? entity
          : authenticatedAccountingEntity,
    })
  );
  await page.route('**/api/v1/accounting/fiscal-years', (route) =>
    route.fulfill({ json: [previousYear, year] })
  );
  await page.route('**/api/v1/accounting/fiscal-years/*/*', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes(previousYear.id)) return route.fulfill({ json: null });

    if (path.endsWith('/accounting-context'))
      return route.fulfill({ json: context.accounting });

    if (path.endsWith('/reporting-context'))
      return route.fulfill({ json: context.reporting });

    if (path.endsWith('/accounting-interval'))
      return route.fulfill({ json: context.accountingInterval });

    if (path.endsWith('/reporting-interval'))
      return route.fulfill({ json: context.reportingInterval });

    return route.fallback();
  });
  await page.route('**/api/v1/users/preferences', (route) =>
    route.fulfill({
      json: {
        userId: authenticatedUser.id,
        createdBy: authenticatedUser.id,
        lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
        appPreferences: { theme: 'light', appUsageMode: 'non_power_user' },
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    })
  );
  await page.route('**/api/v1/auth/refresh-access-token', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.route('**/api/v1/auth/login-with-email', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
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

test('loads the selected entity without switching and shows only current periods', async ({
  page,
}) => {
  const scopes: string[] = [];
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/accounting/fiscal-years'))
      scopes.push(request.headers()['x-accounting-entity-id']);

    if (request.method() !== 'GET' && request.url().includes('/accounting/'))
      writes.push(request.url());
  });
  await page.goto(`/legal-entity/${entity.id}`);
  await expect(page.getByRole('heading', { name: entity.name })).toBeVisible();
  await expect(
    page.getByRole('definition').filter({ hasText: 'Nigerian Naira' })
  ).toBeVisible();

  const accounting = page.getByRole('region', {
    name: 'Accounting context',
    exact: true,
  });

  const reporting = page.getByRole('region', {
    name: 'Reporting context',
    exact: true,
  });

  await expect(
    accounting.getByRole('heading', { name: 'October 2026' })
  ).toBeVisible();
  await expect(
    accounting.getByText('Period 10 of 12', { exact: true })
  ).toBeVisible();
  await expect(accounting.getByText('Open', { exact: true })).toBeVisible();
  await expect(
    reporting.getByRole('heading', { name: 'Q4 2026' })
  ).toBeVisible();
  await expect(
    reporting.getByText('Period 4 of 4', { exact: true })
  ).toBeVisible();
  await expect(reporting.getByText('Open', { exact: true })).toHaveCount(0);
  await expect(reporting.getByText('Closed', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Current', { exact: true })).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: 'View all accounting periods' })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'View all reporting periods' })
  ).toBeDisabled();
  expect(scopes.length).toBeGreaterThanOrEqual(5);
  expect(scopes.every((scope) => scope === entity.id)).toBe(true);
  expect(writes).toEqual([]);
  await expect(
    page.getByRole('button', {
      name: 'Open account management for Integration Entity',
    })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fiscal year: FY 2026' }).click();
  await page.getByRole('menuitemradio', { name: 'FY 2025' }).click();
  await expect(
    page.getByText('No context available for this fiscal year.')
  ).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'October 2026' })).toHaveCount(
    0
  );
  await page.setViewportSize({ width: 375, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeVisible();
});

test('recovers from failed details and supports an entity without fiscal years', async ({
  page,
}) => {
  let failed = true;
  await page.route('**/api/v1/accounting/accounting-entity', (route) => {
    if (route.request().headers()['x-accounting-entity-id'] !== entity.id)
      return route.fallback();

    return route.fulfill(failed ? { status: 500, json: {} } : { json: entity });
  });
  await page.route('**/api/v1/accounting/fiscal-years', (route) =>
    route.fulfill({ json: [] })
  );
  await page.goto(`/legal-entity/${entity.id}`);
  await expect(page.getByRole('alert')).toContainText(
    'We couldn’t load these details'
  );
  failed = false;
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: entity.name })).toBeVisible();
  await expect(
    page.getByText('No fiscal years have been set up for this entity.')
  ).toBeVisible();
});

test('validates and saves the entity name, retaining input on failure', async ({
  page,
}) => {
  let savedEntity: IAccountingEntity = entity;
  let payload: IAccountingEntityUpdateReq | undefined;
  let fail = true;
  await page.route('**/api/v1/accounting/accounting-entity', (route) => {
    if (route.request().headers()['x-accounting-entity-id'] !== entity.id)
      return route.fallback();

    if (route.request().method() === 'PATCH') {
      payload = route.request().postDataJSON();
      if (fail) return route.fulfill({ status: 500, json: {} });

      savedEntity = { ...entity, name: payload?.name ?? entity.name };
    }

    return route.fulfill({ json: savedEntity });
  });
  await page.goto(`/legal-entity/${entity.id}`);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit legal entity' });
  await dialog.getByLabel('Legal entity name', { exact: true }).fill('   ');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByText('Enter a legal entity name.')).toBeVisible();
  await dialog
    .getByLabel('Legal entity name', { exact: true })
    .fill(' Updated Studio ');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByRole('alert')).toContainText(
    'We couldn’t complete this action'
  );
  await expect(
    dialog.getByLabel('Legal entity name', { exact: true })
  ).toHaveValue(' Updated Studio ');
  fail = false;
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Updated Studio' })
  ).toBeVisible();
  expect(payload).toEqual({ name: 'Updated Studio' });
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeFocused();
});

test('confirms archive and prevents dismissal while it is pending', async ({
  page,
}) => {
  let release!: () => void;

  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  let scope: string | undefined;
  await page.route(
    '**/api/v1/accounting/accounting-entity/archive',
    async (route) => {
      scope = route.request().headers()['x-accounting-entity-id'];
      await gate;
      await route.fulfill({ status: 204 });
    }
  );
  await page.goto(`/legal-entity/${entity.id}`);
  await page.getByRole('button', { name: 'More entity actions' }).click();
  await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Archive legal entity' });
  await expect(dialog).toContainText('Its accounting records will be retained');
  expect(scope).toBeUndefined();
  await dialog.getByRole('button', { name: 'Archive entity' }).click();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  release();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Archived', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Switch to entity' })
  ).toBeDisabled();
  expect(scope).toBe(entity.id);
});

test('explains a blocked deletion and only navigates away after success', async ({
  page,
}) => {
  let conflict = true;
  await page.route('**/api/v1/accounting/accounting-entity', (route) => {
    if (route.request().method() !== 'DELETE') return route.fallback();

    expect(route.request().headers()['x-accounting-entity-id']).toBe(entity.id);

    return route.fulfill(
      conflict ? { status: 409, json: {} } : { status: 204 }
    );
  });
  await page.goto(`/legal-entity/${entity.id}`);
  await page.getByRole('button', { name: 'More entity actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete legal entity' });
  await dialog.getByRole('button', { name: 'Delete entity' }).click();
  await expect(dialog.getByRole('alert')).toContainText(
    'has journal entries and cannot be deleted'
  );
  await expect(page).toHaveURL(`/legal-entity/${entity.id}`);
  conflict = false;
  await dialog.getByRole('button', { name: 'Delete entity' }).click();
  await expect(page).toHaveURL('/legal-entity');
});

test('switches only on request and reloads into the chosen entity', async ({
  page,
}) => {
  let payload: unknown;
  await page.route('**/api/v1/accounting/accounting-entity/switch', (route) => {
    payload = route.request().postDataJSON();

    return route.fulfill({ json: entity });
  });
  await page.goto(`/legal-entity/${entity.id}`);
  await page.getByRole('button', { name: 'Switch to entity' }).click();
  await expect(
    page.getByRole('button', {
      name: `Open account management for ${entity.name}`,
    })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Current entity', exact: true })
  ).toBeDisabled();
  expect(payload).toEqual({ accountingEntityId: entity.id });
});
