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

test('updates an unused counterparty, changes its type, and refreshes detail/list caches', async ({
  page,
}) => {
  const state = await setup(page);
  const dialog = await open(page);
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
  await page.getByRole('link', { name: 'All counterparties' }).click();
  await expect(
    page.getByRole('link', { name: 'Updated counterparty', exact: true })
  ).toBeVisible();
});

for (const status of ['posted', 'archived'] as const)
  test(`locks type for ${status}-only usage even with no visible recent transactions`, async ({
    page,
  }) => {
    const state = await setup(page, { [status]: 1 });
    await page.getByPlaceholder('Search transactions...').fill('no matches');
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
      role === 'employer'
        ? { employer: { displayName: 'Employer display', address } }
        : { [role]: { address } };

    const state = await setup(page, {
      party: { ...original, roles: [role], meta },
    });

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
  });

test('uses the recorded role container and preserves the other roles and postal codes', async ({
  page,
}) => {
  const party: ICounterpartyDto = {
    ...original,
    roles: ['vendor', 'contractor', 'employer'],
    meta: {
      vendor: { address },
      contractor: { address },
      employer: { address, displayName: 'Employer' },
    },
  };

  const state = await setup(page, { party });
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
    dialog.getByRole('status', { name: 'Loading vendor form' })
  ).toBeVisible();
  release();
  await dialog.getByLabel('City', { exact: true }).fill('Abuja');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.patches[0]).toEqual({
    meta: {
      vendor: { address: { ...address, city: 'Abuja' } },
      employer: party.meta.employer,
      contractor: party.meta.contractor,
    },
  });
});

test('uses the dialog-selected vendor skeleton and allows a page reload after country loading fails', async ({
  page,
}) => {
  await setup(page, {
    party: { ...original, roles: ['vendor'], meta: { vendor: { address } } },
  });
  let release!: () => void;
  let requested!: () => void;

  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });

  const requestStarted = new Promise<void>((resolve) => {
    requested = resolve;
  });

  let fail = true;
  await page.route('**/api/v1/accounting/jurisdictions', async (route) => {
    requested();
    await waiting;
    if (fail) {
      await route.fulfill({ status: 500, json: {} });

      return;
    }

    await route.fallback();
  });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit counterparty' });
  await requestStarted;
  await expect(
    dialog.getByRole('status', { name: 'Loading vendor form' })
  ).toBeVisible();
  release();
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  fail = false;
  await page.reload();
  await expect(dialog.getByLabel('Country', { exact: true })).toHaveValue(
    'Nigeria'
  );
  await expect(
    dialog.getByRole('button', { name: 'Save changes' })
  ).toBeEnabled();
});

test('clears an optional vendor address and retains an initially null address on name-only edits', async ({
  page,
}) => {
  const state = await setup(page, {
    party: { ...original, roles: ['vendor'], meta: { vendor: { address } } },
  });

  const dialog = await open(page);
  for (const label of [
    'Address',
    'Address line 2',
    'City',
    'State',
    'Postal code',
  ])
    await dialog.getByLabel(label, { exact: true }).fill('');
  await dialog.getByRole('button', { name: 'Clear selection' }).click();
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.patches[0]).toEqual({
    meta: { vendor: { address: null } },
  });
  const reopened = await open(page);
  await expect(reopened.getByLabel('Address', { exact: true })).toHaveValue('');
  await reopened
    .getByLabel('Legal name', { exact: true })
    .fill('Vendor without address');
  await reopened.getByRole('button', { name: 'Save changes' }).click();
  await expect(reopened).not.toBeVisible();
  expect(state.patches[1]).toEqual({
    name: 'Vendor without address',
  });
  expect(state.transactionWrites).toEqual([]);
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

test('retains input on server failure and prevents duplicate submits or dismissal while saving', async ({
  page,
}) => {
  await setup(page);
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
    await waiting;
    await route.fulfill({
      status: 500,
      json: { errorKey: 'untranslated_unknown_failure' },
    });
  });
  await dialog.getByLabel('Name', { exact: true }).fill('Retain me');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  release();
  await expect(
    page.getByText(
      'Unable to update this counterparty. Reload the page and try again.',
      { exact: true }
    )
  ).toBeVisible();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    'Retain me'
  );
  expect(attempts).toBe(1);
});

test('reports failed validation without custom field recovery or exposing raw backend text', async ({
  page,
}) => {
  await setup(page);
  const dialog = await open(page);
  await page.route(endpoint, async (route) => {
    if (route.request().method() !== 'PATCH') {
      await route.fallback();

      return;
    }

    await route.fulfill({
      status: 400,
      json: {
        errorKey: 'counterparty_error_update_invalid',
        validationErrors: [{ field: 'name', message: 'raw internal error' }],
      },
    });
  });
  await dialog.getByLabel('Name', { exact: true }).fill('Changed');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByText('Invalid counterparty update.', { exact: true })
  ).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('raw internal error')).toHaveCount(0);
});

for (const query of [
  'id=bad',
  `id=${id}&type=vendor`,
  'id=00000000-0000-4000-8000-000000000099',
  'type=individual',
])
  test(`keeps query-only identity hints from opening a prop-driven dialog: ${query}`, async ({
    page,
  }) => {
    const state = await setup(page);
    await page.goto(`${url}?${query}`);
    await expect(
      page.getByRole('heading', { name: original.name, exact: true })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(state.patches).toEqual([]);
  });

test('normalizes stale hints and lets failed reads recover through a page reload', async ({
  page,
}) => {
  await setup(page);
  let fail = true;
  await page.route(endpoint, (route) => {
    if (new URL(page.url()).searchParams.get('edit') !== 'true')
      return route.fallback();

    return fail
      ? route.fulfill({ status: 404, json: {} })
      : route.fulfill({ json: original });
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
});

test('opens a direct edit link using the route ID and fetched type even when the supplied type becomes stale', async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto(`${url}?edit=true`);
  const dialog = page.getByRole('dialog', { name: 'Edit counterparty' });
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
    original.name
  );
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page).toHaveURL(url);
  state.setParty({ ...original, type: 'individual' });
  const reopened = await open(page);
  await expect(reopened.getByRole('combobox', { name: 'Type' })).toHaveText(
    'Individual'
  );
  await expect(page).toHaveURL(`${url}?edit=true`);
  await reopened
    .getByLabel('Name', { exact: true })
    .fill('Updated latest record');
  await reopened.getByRole('button', { name: 'Save changes' }).click();
  await expect(reopened).not.toBeVisible();
  expect(state.patches).toEqual([{ name: 'Updated latest record' }]);
  expect(state.transactionWrites).toEqual([]);
});

test('edits Draft details without activation and keeps archived counterparties read-only', async ({
  page,
}) => {
  const state = await setup(page, { party: { ...original, status: 'draft' } });
  const dialog = await open(page);
  await dialog.getByLabel('Name', { exact: true }).fill('Draft edit');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  expect(state.patches[0]).not.toHaveProperty('status');
  await expect(page.getByText('Draft', { exact: true })).toBeVisible();
  state.setParty({ ...state.getParty(), status: 'archived' });
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeDisabled();
});
