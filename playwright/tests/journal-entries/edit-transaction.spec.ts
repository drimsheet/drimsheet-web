import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

const timestamp = '2026-09-21T10:00:00.000Z';
const money = { amount: 250, currencyCode: 'NGN', isMinorUnit: false };

const receipt = {
  url: 'https://example.com/receipt.pdf',
  name: 'receipt.pdf',
  type: 'application/pdf',
  size: 10,
};

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
  createdBy: authenticatedUser.id,
  createdAt: timestamp,
  updatedAt: timestamp,
  attachments: [receipt],
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
  options: { journalEntryNotFound?: boolean; draft?: boolean } = {}
) {
  const requests = {
    detail: 0,
    draftPatch: 0,
    meta: 0,
    metaBody: undefined as unknown,
  };

  let savedEntry: Omit<typeof paymentEntry, 'postedAt'> & {
    postedAt: string | null;
  } = options.draft
    ? { ...paymentEntry, status: 'draft', postedAt: null }
    : paymentEntry;

  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    await route.fulfill({
      json: {
        data: [savedEntry],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/journal-entries/payment-entry', async (route) => {
    requests.detail++;

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

    await route.fulfill({ json: savedEntry });
  });
  await page.route(
    '**/api/v1/journal-entries/payment-entry/meta',
    async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.fallback();

        return;
      }

      requests.meta++;
      const payload = route.request().postDataJSON();
      requests.metaBody = payload;
      savedEntry = {
        ...savedEntry,
        memo: payload.header?.memo ?? savedEntry.memo,
        attachments: savedEntry.attachments.filter(
          ({ url }) => !payload.attachments?.remove?.includes(url)
        ),
      };
      await route.fulfill({ json: savedEntry });
    }
  );
  await page.route(
    '**/api/v1/journal-entries/payment/payment-entry',
    async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.fallback();

        return;
      }

      requests.draftPatch++;
      const { memo } = route.request().postDataJSON();
      savedEntry = { ...savedEntry, memo: `${memo} (saved)` };
      await route.fulfill({ json: savedEntry });
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
  await page.route(
    '**/api/v1/reporting/ledger/account-activity-by-types?*',
    async (route) => {
      const query = new URL(route.request().url()).searchParams;
      await route.fulfill({
        json: {
          currencyCode: 'NGN',
          period: { from: query.get('from'), to: query.get('to') },
          buckets: [],
        },
      });
    }
  );
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

  return requests;
}

test('saves a posted attachment removal with a description edit', async ({
  page,
}) => {
  const requests = await registerRoutes(page);

  await page.goto('/transactions/outflow/payment-entry/edit');

  await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  await expect(page.getByLabel('Description')).toHaveValue(
    'Original description'
  );
  await page.getByLabel('Description').fill('Updated description');
  await page.getByRole('button', { name: 'Remove file receipt.pdf' }).click();
  await expect(page.getByText(receipt.name, { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(
    page.getByText('Transaction updated successfully')
  ).toBeVisible();
  expect(requests.meta).toBe(1);
  expect(requests.metaBody).toEqual({
    header: { memo: 'Updated description' },
    attachments: { remove: [receipt.url] },
  });
});

test('reloads draft details after saving edits', async ({ page }) => {
  const requests = await registerRoutes(page, { draft: true });
  await page.goto('/transactions/outflow/payment-entry/edit');

  await page.getByLabel('Description').fill('Updated draft');
  await page.getByRole('button', { name: 'Save draft' }).click();

  await expect(page.getByText('Draft saved successfully')).toBeVisible();
  await expect(page.getByLabel('Description')).toHaveValue(
    'Updated draft (saved)'
  );
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeEnabled();
  expect(requests.draftPatch).toBe(1);
  expect(requests.detail).toBe(2);
});

test('renders a 404 page when the journal entry does not exist', async ({
  page,
}) => {
  const requests = await registerRoutes(page, {
    journalEntryNotFound: true,
  });

  await page.goto('/transactions/outflow/payment-entry/edit');

  await expect(
    page.getByRole('heading', { name: 'Journal entry not found' })
  ).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
  expect(requests.detail).toBe(1);
});
