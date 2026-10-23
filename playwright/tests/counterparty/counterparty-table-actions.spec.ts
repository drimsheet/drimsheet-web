import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const counterpartyId = '00000000-0000-4000-8000-000000000010';
const detailEndpoint = `**/api/v1/counterparties/${counterpartyId}`;
const archiveEndpoint = `${detailEndpoint}/archive`;
const deletionEligibilityEndpoint = `${detailEndpoint}/deletion-eligibility`;

const counterparty: ICounterpartyDto = {
  id: counterpartyId,
  accountingEntityId: '00000000-0000-4000-8000-000000000002',
  createdBy: authenticatedUser.id,
  name: 'Adenike Supplies',
  status: 'active',
  type: 'organization',
  roles: ['vendor'],
  meta: { vendor: { address: null } },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

async function signIn(page: Page) {
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

async function setup(page: Page) {
  let current = structuredClone(counterparty);
  let deleted = false;
  const archiveRequestBodies: (string | null)[] = [];
  const deleteRequestBodies: (string | null)[] = [];
  const deletionEligibilityRequests: string[] = [];

  await registerAuthenticatedAppRoutes(page);

  for (const path of ['login-with-email', 'refresh-access-token']) {
    await page.route(`**/api/v1/auth/${path}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  }

  await page.route('**/api/v1/accounting/jurisdictions', (route) =>
    route.fulfill({
      json: [
        {
          code: 'NG',
          name: 'Nigeria',
          currencyCode: 'NGN',
          maxFiscalMonths: 12,
          accountingStandards: {},
        },
      ],
    })
  );

  await page.route('**/api/v1/journal-entries?*', (route) =>
    route.fulfill({
      json: {
        data: [],
        meta: { page: 1, limit: 1, total: 0, totalPages: 0 },
      },
    })
  );

  await page.route('**/api/v1/counterparties?*', (route) =>
    route.fulfill({
      json: {
        data: deleted ? [] : [current],
        meta: {
          page: 1,
          limit: 10,
          total: deleted ? 0 : 1,
          totalPages: deleted ? 0 : 1,
        },
      },
    })
  );

  await page.route(detailEndpoint, async (route) => {
    if (route.request().method() === 'DELETE') {
      deleteRequestBodies.push(route.request().postData());
      deleted = true;
      await route.fulfill({ status: 204 });

      return;
    }

    await route.fulfill({ json: current });
  });

  await page.route(deletionEligibilityEndpoint, async (route) => {
    deletionEligibilityRequests.push(route.request().url());
    await route.fulfill({ json: { canDelete: true } });
  });

  await page.route(archiveEndpoint, async (route) => {
    archiveRequestBodies.push(route.request().postData());
    current = {
      ...current,
      status: 'archived',
    };
    await route.fulfill({ json: current });
  });

  await signIn(page);

  return {
    archiveRequestBodies,
    deleteRequestBodies,
    deletionEligibilityRequests,
  };
}

test('opens the role-specific update dialog from the table and keeps its identity in the URL', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/counterparties?counterpartyType=organization');
  await expect(
    page.getByRole('cell', { name: 'Adenike Supplies', exact: true })
  ).toBeVisible();

  const row = page.getByRole('row').filter({ hasText: counterparty.name });

  await row.getByRole('button', { name: 'Open counterparty actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  await expect
    .poll(() => new URL(page.url()).searchParams.get('id'))
    .toBe(counterpartyId);
  await expect
    .poll(() => new URL(page.url()).searchParams.get('type'))
    .toBe('vendor');
  await expect
    .poll(() => new URL(page.url()).searchParams.get('counterpartyType'))
    .toBe('organization');

  const dialog = page.getByRole('dialog', { name: 'Edit counterparty' });
  await expect(dialog.getByLabel('Legal name', { exact: true })).toHaveValue(
    counterparty.name
  );
  await expect(dialog.getByLabel('Address', { exact: true })).toBeVisible();

  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).not.toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.has('id'))
    .toBe(false);
  await expect
    .poll(() => new URL(page.url()).searchParams.has('type'))
    .toBe(false);
  await expect
    .poll(() => new URL(page.url()).searchParams.get('counterpartyType'))
    .toBe('organization');
});

test('asks for confirmation and archives the selected counterparty', async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto('/counterparties');
  await expect(
    page.getByRole('cell', { name: 'Adenike Supplies', exact: true })
  ).toBeVisible();

  const row = page.getByRole('row').filter({ hasText: counterparty.name });

  await row.getByRole('button', { name: 'Open counterparty actions' }).click();
  await page.getByRole('menuitem', { name: 'Archive' }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Archive counterparty?',
  });

  await expect(confirmation).toBeVisible();
  expect(state.archiveRequestBodies).toEqual([]);
  await confirmation
    .getByRole('button', { name: 'Archive counterparty' })
    .click();

  await expect(confirmation).not.toBeVisible();
  expect(state.archiveRequestBodies).toEqual([null]);
  await expect(
    page.getByText('Counterparty archived successfully')
  ).toBeVisible();
  await expect(
    page.getByRole('row').filter({ hasText: counterparty.name })
  ).toContainText('Archived');
});

test('checks eligibility after opening the row menu and deletes the selected counterparty', async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto('/counterparties');

  const row = page.getByRole('row').filter({ hasText: counterparty.name });
  await expect(row).toBeVisible();
  expect(state.deletionEligibilityRequests).toEqual([]);

  await row.getByRole('button', { name: 'Open counterparty actions' }).click();
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
  expect(state.deletionEligibilityRequests).toHaveLength(1);
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Delete counterparty?',
  });

  const deleteButton = confirmation.getByRole('button', {
    name: 'Delete',
    exact: true,
  });

  await expect(confirmation).toContainText(
    'This action will permanently delete Adenike Supplies and cannot be undone.'
  );
  await confirmation.getByLabel('Type "delete" to confirm').fill('Delete');
  await expect(deleteButton).toBeDisabled();
  await confirmation.getByLabel('Type "delete" to confirm').fill('delete');
  await deleteButton.click();

  await expect(confirmation).not.toBeVisible();
  await expect(row).not.toBeVisible();
  await expect(
    page.getByText('Counterparty deleted successfully')
  ).toBeVisible();
  expect(state.deleteRequestBodies).toEqual([null]);
});

test('closes the confirmation and reports a deletion conflict', async ({
  page,
}) => {
  await setup(page);
  await page.route(detailEndpoint, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fallback();

      return;
    }

    await route.fulfill({
      status: 409,
      json: {
        name: 'ConflictError',
        errorKey:
          'counterparty_error_deletion_with_transaction_references_conflict',
        validationErrors: [],
      },
    });
  });

  await page.goto('/counterparties');
  const row = page.getByRole('row').filter({ hasText: counterparty.name });
  await row.getByRole('button', { name: 'Open counterparty actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Delete counterparty?',
  });

  await confirmation.getByLabel('Type "delete" to confirm').fill('delete');
  await confirmation
    .getByRole('button', { name: 'Delete', exact: true })
    .click();

  await expect(confirmation).not.toBeVisible();
  await expect(
    page.getByText(
      'This counterparty cannot be deleted because it is referenced by one or more transactions.'
    )
  ).toBeVisible();
  await expect(row).toBeVisible();
});

test('applies column filters independently of sorting and resets pagination', async ({
  page,
}) => {
  await setup(page);
  await page.route('**/api/v1/counterparties?*', (route) => {
    const params = new URL(route.request().url()).searchParams;
    const filtered = params.get('status') === 'archived';
    const requestedPage = Number(params.get('page') ?? 1);

    return route.fulfill({
      json: {
        data: [{ ...counterparty, status: filtered ? 'archived' : 'active' }],
        meta: {
          page: requestedPage,
          limit: 10,
          total: filtered ? 1 : 11,
          totalPages: filtered ? 1 : 2,
        },
      },
    });
  });
  await page.goto('/counterparties?page=2&sort=name&order=asc');
  await expect(page.getByText('11–11 of 11')).toBeVisible();

  const trigger = page.getByRole('button', {
    name: 'Filter by Status',
    exact: true,
  });

  const header = page.getByRole('columnheader').filter({
    has: page.getByRole('button', { name: 'Sort by Name', exact: true }),
  });

  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  await trigger.click();
  await page.getByRole('checkbox', { name: 'Archived', exact: true }).check();
  await expect
    .poll(() => new URL(page.url()).searchParams.get('status'))
    .toBeNull();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByText('1–1 of 1')).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.get('status'))
    .toBe('archived');
  await expect
    .poll(() => new URL(page.url()).searchParams.get('page'))
    .not.toBe('2');
  await expect(header).toHaveAttribute('aria-sort', 'ascending');

  const activeTrigger = page.getByRole('button', {
    name: 'Filter by Status, 1 active',
    exact: true,
  });

  await expect(activeTrigger).toBeFocused();
  await activeTrigger.click();
  await page.getByRole('checkbox', { name: 'Active', exact: true }).check();
  await page.keyboard.press('Escape');
  await expect(activeTrigger).toBeFocused();
  await activeTrigger.click();
  await expect(
    page.getByRole('checkbox', { name: 'Active', exact: true })
  ).not.toBeChecked();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByText('1–10 of 11')).toBeVisible();
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
});
