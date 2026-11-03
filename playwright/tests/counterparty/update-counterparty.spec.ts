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

test.use({ authenticated: true });

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
  roleDetails: {},
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

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
      roleDetails:
        data.roleDetails === undefined
          ? party.roleDetails
          : (data.roleDetails as ICounterpartyDto['roleDetails']),
      roles:
        data.roleDetails === undefined
          ? party.roles
          : (Object.keys(data.roleDetails) as UCounterpartyRole[]),
      updatedAt: '2026-10-05T00:00:00Z',
    };
    await route.fulfill({ json: party });
  });
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    const status = query.get('status');
    if (status) {
      usageRequests.push(query);
    }

    if (status && usageFailure) {
      await route.fulfill({ status: 500, json: {} });

      return;
    }

    let total = 0;
    if (status === 'posted') {
      total = options.posted ?? 0;
    } else if (status === 'archived') {
      total = options.archived ?? 0;
    }

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
    ) {
      transactionWrites.push(request.method());
    }
  });
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
  const dialog = page.getByRole('dialog', { name: 'Edit person or business' });
  await expect(
    dialog.getByRole('textbox', { name: /^(Name|Legal name)$/ })
  ).toBeVisible();

  return dialog;
}

test('keeps the draft edit dialog open with retained inputs after a pending save fails', async ({
  page,
}) => {
  await setup(page, { party: { ...original, status: 'draft' } });
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
  await test.step('The failed save settles and preserves the edit', async () => {
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
        'Unable to update this person or business. Reload the page and try again.',
        { exact: true }
      )
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toBeEnabled();
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
      'Updated counterparty'
    );
  });
});

for (const role of ['vendor', 'contractor', 'employer'] as const) {
  test(`loads and updates the ${role} form from server role details`, async ({
    page,
  }) => {
    const roleDetails =
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

    await setup(page, {
      party: {
        ...original,
        roles:
          role === 'vendor' ? ['vendor', 'contractor', 'employer'] : [role],
        roleDetails,
      },
    });

    let release!: () => void;

    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });

    await page.route(endpoint, async (route) => {
      if (route.request().method() === 'GET') {
        await waiting;
      }

      await route.fallback();
    });
    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const dialog = page.getByRole('dialog', {
      name: 'Edit person or business',
    });

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
    if (role === 'employer') {
      await expect(dialog.getByLabel(/Display name/)).toHaveValue(
        'Employer display'
      );
    } else {
      await expect(dialog.getByLabel(/Display name/)).toHaveCount(0);
    }

    await dialog.getByLabel('City', { exact: true }).fill('Abuja');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('main')).toContainText('Abuja');
  });
}

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
  const dialog = page.getByRole('dialog', { name: 'Edit person or business' });
  await expect(dialog.getByRole('combobox', { name: 'Type' })).toBeEnabled();
  await expect(
    dialog.getByRole('button', { name: 'Retry', exact: true })
  ).toHaveCount(0);
});

test('shows the loading skeleton, preserves unrelated parameters, and supports refresh/Back/reopen', async ({
  page,
}) => {
  await setup(page);
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
    dialog.getByRole('status', {
      name: 'Loading person or business for editing',
    })
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
});

test('recovers a failed edit read to a usable dialog after page refresh', async ({
  page,
}) => {
  await setup(page);
  let fail = true;
  await page.route(endpoint, (route) => {
    if (new URL(page.url()).searchParams.get('edit') !== 'true') {
      return route.fallback();
    }

    return fail ? route.fulfill({ status: 404, json: {} }) : route.fallback();
  });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  fail = false;
  await page.reload();
  await expect(
    page.getByRole('dialog').getByLabel('Name', { exact: true })
  ).toHaveValue(original.name);
});
