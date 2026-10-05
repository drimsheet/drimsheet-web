import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const timestamp = '2026-09-21T10:00:00.000Z';
const money = { amount: 250, currencyCode: 'NGN', isMinorUnit: false };

const paymentEntry = {
  id: 'payment-entry',
  accountingEntityId: 'entity-1',
  sourceType: 'payment',
  memo: 'Original description',
  status: 'posted',
  effectiveDate: '2026-09-21T00:00:00.000Z',
  postedAt: timestamp,
  voidedAt: null,
  voidingEntryId: null,
  version: 3,
  createdBy: authenticatedUser.id,
  createdAt: timestamp,
  updatedAt: timestamp,
  attachments: [],
  lines: [
    {
      id: 'cash-line',
      entryId: 'payment-entry',
      account: { id: 'ngn-bank', name: 'NGN operating account' },
      counterparty: { id: 'recipient-1', name: 'Acme Supplies' },
      sequenceOrder: 1,
      amount: money,
      exchangeRate: null,
      functionalAmount: money,
      side: 'credit',
      description: 'Original description',
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'category-line',
      entryId: 'payment-entry',
      account: { id: 'office-expense', name: 'Office expense' },
      counterparty: { id: 'recipient-1', name: 'Acme Supplies' },
      sequenceOrder: 2,
      amount: money,
      exchangeRate: null,
      functionalAmount: money,
      side: 'debit',
      description: 'Original description',
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
};

const sourceAccounts = [
  {
    id: 'ngn-bank',
    code: '1000',
    name: 'NGN operating account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    behavior: 'bank',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
];

const destinationAccounts = [
  {
    id: 'office-expense',
    code: '6000',
    name: 'Office expense',
    type: 'expense',
    subType: 'general_and_administrative',
    behavior: 'expense',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
];

async function registerRoutes(
  page: Page,
  journalEntryRequests: string[],
  rectificationBodies: unknown[],
  options: { journalEntryNotFound?: boolean } = {}
) {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/auth/login-with-email', async (route) => {
    await route.fulfill({ json: { accessToken: 'integration-test-token' } });
  });
  await page.route('**/api/v1/auth/refresh-access-token', async (route) => {
    await route.fulfill({ json: { accessToken: 'integration-test-token' } });
  });
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    await route.fulfill({
      json: {
        data: [paymentEntry],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/journal-entries/payment-entry', async (route) => {
    journalEntryRequests.push(route.request().url());

    if (options.journalEntryNotFound) {
      await route.fulfill({
        status: 404,
        json: {
          name: 'NotFoundError',
          errorKey: 'app_error_resource_not_found',
          validationErrors: [],
        },
      });

      return;
    }

    await route.fulfill({ json: paymentEntry });
  });
  await page.route(
    '**/api/v1/journal-entries/payment-entry/rectify',
    async (route) => {
      rectificationBodies.push(JSON.parse(route.request().postData() ?? '{}'));
      await route.fulfill({
        json: {
          mode: 'update_meta',
          originalJournalEntryId: 'payment-entry',
          currentJournalEntryId: 'payment-entry',
          reversingJournalEntryId: null,
          journalEntry: {},
        },
      });
    }
  );
  await page.route('**/api/v1/ledger/posting-accounts*', async (route) => {
    const side = new URL(route.request().url()).searchParams.get('side');
    const data = side === 'source' ? sourceAccounts : destinationAccounts;
    await route.fulfill({
      json: {
        data,
        meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/counterparties*', async (route) => {
    await route.fulfill({
      json: {
        data: [
          {
            id: 'recipient-1',
            accountingEntityId: 'entity-1',
            name: 'Acme Supplies',
            status: 'active',
            type: 'organization',
            roles: ['vendor'],
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test('loads a direct edit route and rectifies the prefilled transaction', async ({
  page,
}) => {
  const journalEntryRequests: string[] = [];
  const rectificationBodies: unknown[] = [];
  await registerRoutes(page, journalEntryRequests, rectificationBodies);
  await signIn(page);

  await page.goto('/transactions/outflow/payment-entry/edit');

  await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  await expect(page.getByLabel('Description')).toHaveValue(
    'Original description'
  );
  await expect.poll(() => journalEntryRequests.length).toBe(1);

  await page.getByLabel('Description').fill('Updated description');
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(page).toHaveURL('/transactions');
  expect(rectificationBodies).toEqual([
    expect.objectContaining({
      expectedVersion: 3,
      sourceType: 'payment',
      memo: 'Updated description',
      attachments: [],
      sourceLine: expect.objectContaining({ id: 'cash-line' }),
      destinationLines: [expect.objectContaining({ id: 'category-line' })],
    }),
  ]);
});

test('renders a 404 page when the journal entry does not exist', async ({
  page,
}) => {
  const journalEntryRequests: string[] = [];
  await registerRoutes(page, journalEntryRequests, [], {
    journalEntryNotFound: true,
  });
  await signIn(page);

  await page.goto('/transactions/outflow/payment-entry/edit');

  await expect(
    page.getByRole('heading', { name: 'Journal entry not found' })
  ).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
  await expect.poll(() => journalEntryRequests.length).toBe(1);

  await page.getByRole('button', { name: 'Back to transactions' }).click();

  await expect(page).toHaveURL('/transactions');
});
