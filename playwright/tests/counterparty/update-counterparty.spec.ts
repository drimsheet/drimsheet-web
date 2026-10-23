import type {
  ICounterpartyDto,
  ICounterpartyUpdateReq,
  IHttpErrorDto,
  UCounterpartyRole,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const id = '00000000-0000-4000-8000-000000000010';
const endpoint = `**/api/v1/counterparties/${id}`;
const url = `/counterparties/${id}`;

const address = {
  line1: '14 Marina Road',
  line2: 'Floor 2',
  city: 'Lagos',
  region: 'Lagos',
  postalCode: '100001',
  countryCode: 'NG',
};

const original: ICounterpartyDto = {
  id,
  accountingEntityId: '00000000-0000-4000-8000-000000000002',
  createdBy: authenticatedUser.id,
  name: 'Adenike Supplies',
  type: 'organization',
  status: 'active',
  roles: [],
  meta: {},
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const restriction =
  'This counterparty’s type cannot be changed because it has been used in a transaction. Create a new counterparty if a different type is required.';

interface ISetupOptions {
  party?: ICounterpartyDto;
  posted?: number;
  archived?: number;
  usageFailure?: boolean;
}

async function setup(page: Page, options: ISetupOptions = {}) {
  let party = structuredClone(options.party ?? original);
  const patches: ICounterpartyUpdateReq[] = [];
  const transactionWrites: string[] = [];
  const usageRequests: URLSearchParams[] = [];
  let failure: IHttpErrorDto | undefined;
  let usageFailure = options.usageFailure ?? false;
  await registerAuthenticatedAppRoutes(page);
  for (const path of ['login-with-email', 'refresh-access-token'])
    await page.route(`**/api/v1/auth/${path}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  await page.route('**/api/v1/users/preferences', (route) =>
    route.fulfill({
      json: {
        userId: authenticatedUser.id,
        createdBy: authenticatedUser.id,
        lastActiveAccountingEntityId: party.accountingEntityId,
        appPreferences: { appUsageMode: 'non_power_user' },
      },
    })
  );
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
  await page.route('**/api/v1/counterparties?*', (route) =>
    route.fulfill({
      json: {
        data: [party],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    })
  );
  await page.route(endpoint, async (route) => {
    if (route.request().method() !== 'PATCH') {
      await route.fulfill({ json: party });

      return;
    }

    const data = route.request().postDataJSON() as ICounterpartyUpdateReq;
    patches.push(data);
    if (failure) {
      const next = failure;
      failure = undefined;
      await route.fulfill({ status: 409, json: next });

      return;
    }

    party = {
      ...party,
      name: data.name ?? party.name,
      type: data.type ?? party.type,
      meta:
        data.meta === undefined
          ? party.meta
          : (data.meta as ICounterpartyDto['meta']),
      roles:
        data.meta === undefined
          ? party.roles
          : (Object.keys(data.meta) as UCounterpartyRole[]),
      updatedAt: '2026-10-05T00:00:00Z',
    };
    await route.fulfill({ json: party });
  });
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    const status = query.get('status');
    if (status) usageRequests.push(query);

    if (status && usageFailure) {
      await route.fulfill({ status: 500, json: {} });

      return;
    }

    let total = 0;
    if (status === 'posted') total = options.posted ?? 0;
    else if (status === 'archived') total = options.archived ?? 0;

    await route.fulfill({
      json: {
        data: [],
        meta: {
          page: 1,
          limit: Number(query.get('limit')),
          total,
          totalPages: total,
        },
      },
    });
  });
  page.on('request', (request) => {
    if (
      request.url().includes('/journal-entries') &&
      request.method() !== 'GET'
    )
      transactionWrites.push(request.method());
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto(`${url}?keep=preserved`);
  await expect(
    page.getByRole('heading', { name: party.name, exact: true })
  ).toBeVisible();

  return {
    patches,
    transactionWrites,
    usageRequests,
    getParty: () => party,
    setParty: (next: ICounterpartyDto) => {
      party = next;
    },
    setFailure: (errorKey: string) => {
      failure = { name: 'Conflict', errorKey };
    },
    setUsageFailure: (value: boolean) => {
      usageFailure = value;
    },
  };
}

async function open(page: Page) {
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit counterparty' });
  await expect(
    dialog.getByRole('textbox', { name: /^(Name|Legal name)$/ })
  ).toBeVisible();

  return dialog;
}

test('preserves a failed draft edit, blocks duplicate saves, and refreshes detail/list caches', async ({
  page,
}) => {
  const state = await setup(page, { party: { ...original, status: 'draft' } });
  const dialog = await open(page);
  let release!: () => void;

  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });

  let attempts = 0;
  await page.route(endpoint, async (route) => {
    if (route.request().method() !== 'PATCH') {
      await route.fallback();

      return;
    }

    attempts++;
    if (attempts > 2) {
      await route.fallback();

      return;
    }

    await waiting;
    await route.fulfill({
      status: attempts === 1 ? 500 : 400,
      json:
        attempts === 1
          ? { errorKey: 'untranslated_unknown_failure' }
          : {
              errorKey: 'counterparty_error_update_invalid',
              validationErrors: [
                { field: 'name', message: 'raw internal error' },
              ],
            },
    });
  });

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(dialog).toBeInViewport();
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth
    )
  ).toBe(true);
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeEnabled();
  await dialog.getByLabel('Name', { exact: true }).click();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeFocused();
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeEnabled();
  await expect(page).toHaveURL(`${url}?keep=preserved&edit=true`);
  await dialog
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('Updated counterparty');
  await dialog.getByRole('combobox', { name: 'Type' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await test.step('Failed saves settle, preserve edits, and suppress raw server text', async () => {
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Enter');
    expect(attempts).toBe(1);
    release();
    await expect(
      page.getByText(
        'Unable to update this counterparty. Reload the page and try again.',
        { exact: true }
      )
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toBeEnabled();
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
      'Updated counterparty'
    );
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      page.getByText('Invalid counterparty update.', { exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toBeEnabled();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(page.getByText('raw internal error')).toHaveCount(0);
  });
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.patches).toEqual([
    { name: 'Updated counterparty', type: 'individual' },
  ]);
  expect(state.transactionWrites).toEqual([]);
  await expect(
    page.getByRole('heading', { name: 'Updated counterparty', exact: true })
  ).toBeVisible();
  await expect(page).toHaveURL(`${url}?keep=preserved`);
  await test.step('Editing preserves Draft status and archived records remain read-only', async () => {
    expect(attempts).toBe(3);
    expect(state.patches[0]).not.toHaveProperty('status');
    await expect(page.getByText('Draft', { exact: true })).toBeVisible();
    state.setParty({ ...state.getParty(), status: 'archived' });
    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Edit', exact: true })
    ).toBeDisabled();
  });
  await page.getByRole('link', { name: 'All counterparties' }).click();
  await expect(
    page.getByRole('link', { name: 'Updated counterparty', exact: true })
  ).toBeVisible();
});

test('locks type for archived-only usage even with no visible recent transactions', async ({
  page,
}) => {
  const state = await setup(page, { archived: 1 });
  await expect(
    page.getByRole('heading', { name: 'No transactions yet' })
  ).toBeVisible();
  await expect(
    page.getByPlaceholder('Search transactions...')
  ).not.toBeVisible();
  const dialog = await open(page);
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeDisabled();
  await expect(dialog.getByText(restriction)).toBeVisible();
  await dialog
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('New name');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.patches).toEqual([{ name: 'New name' }]);
  expect(state.usageRequests.map((query) => query.get('status'))).toEqual(
    expect.arrayContaining(['posted', 'archived'])
  );
  for (const query of state.usageRequests) {
    expect(query.get('counterpartyId')).toBe(id);
    expect(query.has('search')).toBe(false);
    expect(query.get('limit')).toBe('1');
  }
});

for (const role of ['vendor', 'contractor', 'employer'] as const)
  test(`loads and updates the ${role} form from server metadata`, async ({
    page,
  }) => {
    const meta =
      role === 'vendor'
        ? {
            vendor: { address },
            contractor: { address },
            employer: { address, displayName: 'Employer' },
          }
        : {
            [role]: {
              address,
              ...(role === 'employer' && { displayName: 'Employer display' }),
            },
          };

    const state = await setup(page, {
      party: {
        ...original,
        roles:
          role === 'vendor' ? ['vendor', 'contractor', 'employer'] : [role],
        meta,
      },
    });

    let countryFailure = role === 'vendor';
    if (role === 'vendor')
      await page.route('**/api/v1/accounting/jurisdictions', (route) =>
        countryFailure
          ? route.fulfill({ status: 500, json: {} })
          : route.fallback()
      );

    let release!: () => void;

    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });

    await page.route(endpoint, async (route) => {
      if (route.request().method() === 'GET') await waiting;

      await route.fallback();
    });
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit counterparty' });
    await expect(
      dialog.getByRole('status', { name: `Loading ${role} form` })
    ).toBeVisible();
    await expect(dialog.getByRole('textbox')).toHaveCount(0);
    release();
    if (role === 'vendor')
      await test.step('Vendor prerequisites recover only after refresh', async () => {
        await expect(
          page.getByRole('heading', { name: 'Something went wrong' })
        ).toBeVisible();
        countryFailure = false;
        await page.reload();
      });

    await expect(dialog.getByLabel('Address', { exact: true })).toHaveValue(
      address.line1
    );
    await expect(dialog.getByLabel('Postal code')).toHaveValue(
      address.postalCode
    );
    if (role === 'employer')
      await expect(dialog.getByLabel(/Display name/)).toHaveValue(
        'Employer display'
      );
    else await expect(dialog.getByLabel(/Display name/)).toHaveCount(0);

    await dialog.getByLabel('City', { exact: true }).fill('Abuja');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    expect(state.patches[0].meta?.[role]?.address).toEqual({
      ...address,
      city: 'Abuja',
    });
    expect(state.patches[0]).not.toHaveProperty('status');
    if (role === 'vendor') {
      expect(state.patches[0].meta?.contractor).toEqual(meta.contractor);
      expect(state.patches[0].meta?.employer).toEqual(meta.employer);
    }
  });

test('reports a raced type-use conflict without rewriting or retrying the failed update', async ({
  page,
}) => {
  const state = await setup(page);
  const dialog = await open(page);
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeEnabled();
  await dialog.getByLabel('Name', { exact: true }).fill('Retained name');
  await dialog.getByRole('combobox', { name: 'Type' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  state.setFailure(
    'counterparty_error_type_change_after_transaction_use_conflict'
  );
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText(restriction, { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    'Retained name'
  );
  await expect(
    dialog.getByRole('button', { name: /Retry|Reload latest/ })
  ).toHaveCount(0);
  expect(state.patches).toEqual([
    { name: 'Retained name', type: 'individual' },
  ]);
});

test('lets a failed usage check reach the app error boundary and recovers on page reload', async ({
  page,
}) => {
  const state = await setup(page, { usageFailure: true });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  state.setUsageFailure(false);
  await page.reload();
  const dialog = page.getByRole('dialog', { name: 'Edit counterparty' });
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeEnabled();
  await expect(
    dialog.getByRole('button', { name: 'Retry', exact: true })
  ).toHaveCount(0);
  await dialog.getByLabel('Name', { exact: true }).fill('Allowed name');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.patches[0]).toEqual({
    name: 'Allowed name',
  });
});

test('shows the loading skeleton, preserves unrelated parameters, and supports refresh/Back/reopen', async ({
  page,
}) => {
  const state = await setup(page);
  let release!: () => void;

  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(endpoint, async (route) => {
    await waiting;
    await route.fulfill({ json: original });
  });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('status', { name: 'Loading counterparty for editing' })
  ).toBeVisible();
  await expect(page).toHaveURL(`${url}?keep=preserved&edit=true`);
  release();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    original.name
  );
  await page.reload();
  await expect(
    page.getByRole('dialog').getByLabel('Name', { exact: true })
  ).toHaveValue(original.name);
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const reopened = await open(page);
  await reopened.getByLabel('Name', { exact: true }).fill('Discard me');
  await reopened.getByRole('button', { name: 'Cancel' }).click();
  await expect(page).toHaveURL(`${url}?keep=preserved`);
  await open(page);
  await expect(
    page.getByRole('dialog').getByLabel('Name', { exact: true })
  ).toHaveValue(original.name);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save changes' })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(state.patches).toEqual([]);
});

// Surely this is bullshit
test('normalizes stale hints and lets failed reads recover through a page reload', async ({
  page,
}) => {
  const state = await setup(page);
  await test.step('Identity hints alone do not open editing', async () => {
    await page.goto(`${url}?id=invalid&type=vendor`);
    await expect(
      page.getByRole('heading', { name: original.name, exact: true })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(state.patches).toEqual([]);
  });
  let fail = true;
  await page.route(endpoint, (route) => {
    if (new URL(page.url()).searchParams.get('edit') !== 'true')
      return route.fallback();

    return fail ? route.fulfill({ status: 404, json: {} }) : route.fallback();
  });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  fail = false;
  await page.reload();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    original.name
  );
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await page.goto(
    `${url}?edit=true&id=invalid&type=individual&editCounterpartyRole=contractor&keep=preserved`
  );
  await expect(
    page.getByRole('dialog').getByLabel('Name', { exact: true })
  ).toHaveValue(original.name);
  await expect(page).toHaveURL(`${url}?edit=true&keep=preserved`);
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  state.setParty({ ...original, type: 'individual' });
  const reopened = await open(page);
  await expect(reopened.getByRole('combobox', { name: 'Type' })).toHaveText(
    'Individual'
  );
  await expect(page).toHaveURL(`${url}?keep=preserved&edit=true`);
  await reopened
    .getByLabel('Name', { exact: true })
    .fill('Updated latest record');
  await reopened.getByRole('button', { name: 'Save changes' }).click();
  await expect(reopened).not.toBeVisible();
  expect(state.patches).toEqual([{ name: 'Updated latest record' }]);
  expect(state.transactionWrites).toEqual([]);
});
