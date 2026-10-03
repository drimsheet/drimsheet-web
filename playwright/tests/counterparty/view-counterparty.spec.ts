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
  version: 1,
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
      version: 1,
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
          version: 1,
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
          version: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };
  }
);

async function setup(page: Page) {
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
        data: [counterparty],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    })
  );
  await page.route(detailEndpoint, (route) =>
    route.fulfill({ json: counterparty })
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
  ).toBeDisabled();
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
  await expect(page.getByText('Showing 0 of 0')).toBeVisible();
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
