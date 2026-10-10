import type {
  ICounterpartyDto,
  IJournalEntryListDto,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const timestamp = '2026-09-18T10:00:00.000Z';

const counterparty: ICounterpartyDto = {
  id: '00000000-0000-4000-8000-000000000010',
  accountingEntityId: '00000000-0000-4000-8000-000000000002',
  createdBy: authenticatedUser.id,
  name: 'Adenike Supplies Ltd',
  type: 'organization',
  status: 'active',
  roles: ['vendor', 'contractor'],
  meta: {
    vendor: {
      address: {
        line1: '14 Adeola Odeku Street',
        city: 'Victoria Island',
        region: 'Lagos',
        countryCode: 'NG',
      },
    },
  },
  createdAt: '2026-01-12T00:00:00.000Z',
  updatedAt: timestamp,
};

const detailUrl = `/counterparties/${counterparty.id}`;
const detailEndpoint = `**/api/v1/counterparties/${counterparty.id}`;
const deletionEligibilityEndpoint = `${detailEndpoint}/deletion-eligibility`;
const transactionsEndpoint = '**/api/v1/journal-entries?*';

const entries: IJournalEntryListDto[] = Array.from(
  { length: 5 },
  (_, index) => {
    const id = `payment-${index}`;
    const amount = { amount: 245000, currencyCode: 'NGN', isMinorUnit: false };

    return {
      id,
      accountingEntityId: counterparty.accountingEntityId,
      sourceType: 'payment',
      memo: 'September supplies',
      status: 'posted',
      effectiveDate: timestamp,
      postedAt: timestamp,
      voidedAt: null,
      voidingEntryId: null,
      createdBy: authenticatedUser.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      attachments: [],
      lines: [
        {
          id: `${id}-cash`,
          entryId: id,
          account: { id: 'bank', name: 'Business bank account' },
          counterparty: {
            id: counterparty.id,
            name: counterparty.name,
            status: counterparty.status,
          },
          sequenceOrder: 1,
          amount,
          exchangeRate: null,
          functionalAmount: amount,
          side: 'credit',
          description: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: `${id}-expense`,
          entryId: id,
          account: { id: 'supplies', name: 'Office supplies' },
          counterparty: {
            id: counterparty.id,
            name: counterparty.name,
            status: counterparty.status,
          },
          sequenceOrder: 2,
          amount,
          exchangeRate: null,
          functionalAmount: amount,
          side: 'debit',
          description: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };
  }
);

async function setup(page: Page) {
  let deleted = false;
  const deleteRequestBodies: (string | null)[] = [];

  await registerAuthenticatedAppRoutes(page);
  for (const endpoint of [
    '**/api/v1/auth/login-with-email',
    '**/api/v1/auth/refresh-access-token',
  ]) {
    await page.route(endpoint, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  }

  await page.route('**/api/v1/counterparties?*', (route) =>
    route.fulfill({
      json: {
        data: deleted ? [] : [counterparty],
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

    await route.fulfill({ json: counterparty });
  });
  await page.route(deletionEligibilityEndpoint, (route) =>
    route.fulfill({ json: { canDelete: false } })
  );
  await page.route(transactionsEndpoint, (route) => {
    const params = new URL(route.request().url()).searchParams;
    const pageNumber = Number(params.get('page')) || 1;
    const limit = Number(params.get('limit')) || 10;

    return route.fulfill({
      json: {
        data: entries,
        meta: {
          page: pageNumber,
          limit,
          total: 18,
          totalPages: Math.ceil(18 / limit),
        },
      },
    });
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');

  return { deleteRequestBodies };
}

async function expectProfile(page: Page) {
  await expect(
    page.getByRole('heading', { name: counterparty.name, exact: true })
  ).toBeVisible();
}

test('opens the linked profile, supplies scoped data to the existing table, and supports refresh and back', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/counterparties');

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/api/v1/journal-entries?')
  );

  await page
    .getByRole('link', { name: counterparty.name, exact: true })
    .click();
  await expect(page).toHaveURL(detailUrl);
  const params = new URL((await requestPromise).url()).searchParams;
  expect(Object.fromEntries(params)).toMatchObject({
    counterpartyId: counterparty.id,
    page: '1',
    limit: '5',
    orderBy: 'effectiveDate',
    sortDirection: 'desc',
  });
  expect(params.has('status')).toBe(false);
  await expectProfile(page);
  await expect(page.getByText('14 Adeola Odeku Street')).toBeVisible();
  await expect(page.getByText('Nigeria', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeEnabled();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(6);
  await expect(page.getByText('Showing 5 of 18')).toBeVisible();
  await page.reload();
  await expectProfile(page);
  await page.getByRole('link', { name: 'All counterparties' }).click();
  await expect(page).toHaveURL('/counterparties');
});

test('supplies counterparty-scoped search and sorting from the detail page', async ({
  page,
}) => {
  await setup(page);
  await page.goto(detailUrl);
  await expectProfile(page);

  const searchRequest = page.waitForRequest(
    (request) =>
      request.url().includes('/api/v1/journal-entries?') &&
      new URL(request.url()).searchParams.get('search') === 'supplies'
  );

  await page.getByPlaceholder(/Search transactions/i).fill('supplies');
  expect(
    new URL((await searchRequest).url()).searchParams.get('counterpartyId')
  ).toBe(counterparty.id);

  const sortRequest = page.waitForRequest(
    (request) =>
      request.url().includes('/api/v1/journal-entries?') &&
      new URL(request.url()).searchParams.get('sortDirection') === 'asc'
  );

  await page.getByRole('columnheader', { name: 'Date', exact: true }).click();
  expect(
    Object.fromEntries(new URL((await sortRequest).url()).searchParams)
  ).toMatchObject({
    counterpartyId: counterparty.id,
    search: 'supplies',
    orderBy: 'effectiveDate',
    sortDirection: 'asc',
  });

  const descendingRequest = page.waitForRequest(
    (request) =>
      request.url().includes('/api/v1/journal-entries?') &&
      new URL(request.url()).searchParams.get('sortDirection') === 'desc'
  );

  await page.getByRole('columnheader', { name: 'Date', exact: true }).click();
  expect(
    Object.fromEntries(new URL((await descendingRequest).url()).searchParams)
  ).toMatchObject({
    counterpartyId: counterparty.id,
    search: 'supplies',
    orderBy: 'effectiveDate',
    sortDirection: 'desc',
  });
  await expect(
    page.getByRole('link', { name: 'View all transactions' })
  ).toHaveAttribute('href', `/transactions?counterpartyId=${counterparty.id}`);
});

test('uses the error boundary for a missing profile without querying transactions', async ({
  page,
}) => {
  await setup(page);
  let transactionsRequested = false;
  await page.route(detailEndpoint, (route) =>
    route.fulfill({ status: 404, json: {} })
  );
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/journal-entries'))
      transactionsRequested = true;
  });
  await page.goto(detailUrl);
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  expect(transactionsRequested).toBe(false);
  await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
});

test('uses the error boundary when transactions fail and recovers through its retry action', async ({
  page,
}) => {
  await setup(page);
  let fail = true;
  await page.route(transactionsEndpoint, (route) =>
    fail
      ? route.fulfill({ status: 500, json: {} })
      : route.fulfill({
          json: {
            data: [],
            meta: { page: 1, limit: 5, total: 0, totalPages: 0 },
          },
        })
  );
  await page.goto(detailUrl);
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try Again', exact: true }).click();
  await expectProfile(page);
  await expect(
    page.getByRole('heading', { name: 'No transactions yet' })
  ).toBeVisible();
});

test('recovers from a failed profile request through the error boundary', async ({
  page,
}) => {
  await setup(page);
  let fail = true;
  await page.route(detailEndpoint, (route) =>
    fail
      ? route.fulfill({ status: 500, json: {} })
      : route.fulfill({ json: counterparty })
  );
  await page.goto(detailUrl);
  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try Again', exact: true }).click();
  await expectProfile(page);
});

test('shows loading before data arrives and remains usable at mobile width', async ({
  page,
}) => {
  await setup(page);
  let release!: () => void;

  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(detailEndpoint, async (route) => {
    await ready;
    await route.fulfill({ json: counterparty });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(detailUrl);
  await expect(page.getByText('Loading counterparty details')).toBeAttached();
  release();
  await expectProfile(page);
  await expect(
    page.getByRole('link', { name: 'View all transactions' })
  ).toBeVisible();
});

test('checks deletion eligibility and deletes from the counterparty details page', async ({
  page,
}) => {
  const state = await setup(page);
  let eligibilityRequests = 0;
  let releaseEligibility!: () => void;

  const eligibilityReady = new Promise<void>((resolve) => {
    releaseEligibility = resolve;
  });

  await page.route(deletionEligibilityEndpoint, async (route) => {
    eligibilityRequests += 1;
    await eligibilityReady;
    await route.fulfill({ json: { canDelete: true } });
  });

  await page.goto(detailUrl);
  await expectProfile(page);
  expect(eligibilityRequests).toBe(0);
  await page.getByRole('button', { name: 'Open counterparty actions' }).click();
  await expect(
    page.getByRole('status', {
      name: 'Checking whether this counterparty can be deleted',
    })
  ).toBeVisible();

  releaseEligibility();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Delete counterparty?',
  });

  await confirmation.getByLabel('Type "delete" to confirm').fill('delete');
  await confirmation
    .getByRole('button', { name: 'Delete', exact: true })
    .click();

  await expect(confirmation).not.toBeVisible();
  await expect(page).toHaveURL('/counterparties');
  await expect(
    page.getByText('Counterparty deleted successfully')
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: counterparty.name, exact: true })
  ).not.toBeVisible();
  expect(state.deleteRequestBodies).toEqual([null]);
});

test('shows a compact empty profile on desktop and mobile without transaction controls', async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.route(detailEndpoint, (route) =>
    route.fulfill({
      json: {
        ...counterparty,
        name: 'Odion Oboite',
        type: 'individual',
        roles: [],
        meta: {},
      },
    })
  );
  await page.route(transactionsEndpoint, (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } },
    })
  );
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(detailUrl);
  await expect(
    page.getByRole('heading', { name: 'No transactions yet' })
  ).toBeVisible();
  await expect(
    page.getByText('Transactions involving Odion Oboite will appear here.')
  ).toBeVisible();
  await expect(page.getByPlaceholder(/Search transactions/i)).not.toBeVisible();
  await expect(page.getByRole('table')).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View all transactions' })
  ).not.toBeVisible();
  await expect(page.getByText('Showing 0 of 0')).not.toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('empty-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('heading', { name: 'Odion Oboite' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('empty-mobile.png'),
    fullPage: true,
  });
});

test('keeps search controls and focus when a search has no matches', async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.route(transactionsEndpoint, (route) => {
    const filtered = new URL(route.request().url()).searchParams.has('search');

    return route.fulfill({
      json: {
        data: filtered ? [] : entries,
        meta: {
          page: 1,
          limit: 5,
          total: filtered ? 0 : 18,
          totalPages: filtered ? 0 : 4,
        },
      },
    });
  });
  await page.goto(detailUrl);
  await expect(page.getByText('Showing 5 of 18')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('populated-desktop.png'),
    fullPage: true,
  });
  const search = page.getByPlaceholder(/Search transactions/i);
  await search.fill('unmatched');
  await expect(page.getByText('No records found')).toBeVisible();
  await expect(search).toHaveValue('unmatched');
  await expect(search).toBeFocused();
  await expect(
    page.getByRole('link', { name: 'View all transactions' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'No transactions yet' })
  ).not.toBeVisible();
  await search.fill('');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(6);
  await expect(search).toBeFocused();
});

test('rechecks eligibility on reopening and hides delete after a failed check', async ({
  page,
}) => {
  await setup(page);
  let requests = 0;
  await page.route(deletionEligibilityEndpoint, (route) => {
    requests += 1;
    if (requests === 1) return route.fulfill({ json: { canDelete: true } });

    return route.fulfill({ status: 500, json: {} });
  });
  await page.goto(detailUrl);
  await expectProfile(page);
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Open counterparty actions' }).click();
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open counterparty actions' }).click();
  await expect(page.getByText('No available actions')).toBeVisible();
  await expect(
    page.getByRole('menuitem', { name: 'Delete' })
  ).not.toBeVisible();
  expect(requests).toBe(2);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeEnabled();
});
