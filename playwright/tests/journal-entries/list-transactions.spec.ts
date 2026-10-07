import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const timestamp = '2026-09-16T10:00:00.000Z';

const money = (amount: number, currencyCode = 'NGN') => ({
  amount,
  currencyCode,
  isMinorUnit: false,
});

const accountNamesById: Record<string, string> = {
  'cash-main': 'Main checking',
  'cash-usd': 'USD account',
  'bank-fees': 'Bank fees',
  gift: 'Gift',
  services: 'Professional services',
};

const counterpartyNamesById: Record<string, string> = {
  osahon: 'Osahon Oboite',
  acme: 'Acme Consulting',
};

const line = (
  id: string,
  entryId: string,
  accountId: string,
  counterpartyId: string,
  sequenceOrder: number,
  amount: ReturnType<typeof money>,
  {
    description = null,
    exchangeRate = null,
    functionalAmount = amount,
  }: {
    description?: string | null;
    exchangeRate?: Record<string, unknown> | null;
    functionalAmount?: ReturnType<typeof money>;
  } = {}
) => ({
  id,
  entryId,
  account: { id: accountId, name: accountNamesById[accountId] },
  counterparty: {
    id: counterpartyId,
    name: counterpartyNamesById[counterpartyId],
  },
  sequenceOrder,
  amount,
  exchangeRate,
  functionalAmount,
  side: 'debit',
  description,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const entry = (
  id: string,
  sourceType: string,
  lines: ReturnType<typeof line>[]
) => ({
  id,
  accountingEntityId: 'entity-1',
  sourceType,
  memo: null,
  status: 'posted',
  effectiveDate: timestamp,
  postedAt: timestamp,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: authenticatedUser.id,
  createdAt: timestamp,
  updatedAt: timestamp,
  attachments: [],
  lines,
});

const journalEntries = [
  entry('payment-1', 'payment', [
    line('p-1', 'payment-1', 'cash-main', 'osahon', 1, money(125_000)),
    line('p-2', 'payment-1', 'gift', 'osahon', 2, money(125_000)),
  ]),
  entry('receipt-1', 'receipt', [
    line('r-1', 'receipt-1', 'services', 'acme', 1, money(85_000)),
    line('r-2', 'receipt-1', 'cash-main', 'acme', 2, money(85_000)),
  ]),
  entry('transfer-1', 'transfer', [
    line('t-1', 'transfer-1', 'cash-usd', 'osahon', 1, money(1_000, 'USD'), {
      exchangeRate: {
        asOf: timestamp,
        baseCurrencyCode: 'USD',
        createdAt: timestamp,
        currencyPair: 'USD/NGN',
        rate: 1590,
        source: 'User supplied',
        targetCurrencyCode: 'NGN',
        type: 'negotiated',
      },
      functionalAmount: money(1_590_000),
    }),
    line('t-2', 'transfer-1', 'cash-main', 'osahon', 2, money(1_590_000)),
    line('t-3', 'transfer-1', 'bank-fees', 'osahon', 3, money(10, 'USD'), {
      description: 'International transfer charge',
    }),
  ]),
];

const accounts = [
  { id: 'cash-main', name: 'Main checking' },
  { id: 'cash-usd', name: 'USD account' },
  { id: 'bank-fees', name: 'Bank fees' },
  { id: 'gift', name: 'Gift' },
  { id: 'services', name: 'Professional services' },
];

const counterparties = [
  { id: 'osahon', name: 'Osahon Oboite' },
  { id: 'acme', name: 'Acme Consulting' },
];

async function registerRoutes(
  page: Page,
  journalQueries: URLSearchParams[],
  journalEntryDetailRequests: string[]
) {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/auth/login-with-email', async (route) => {
    await route.fulfill({ json: { accessToken: 'integration-test-token' } });
  });
  await page.route('**/api/v1/auth/refresh-access-token', async (route) => {
    await route.fulfill({ json: { accessToken: 'integration-test-token' } });
  });
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    journalQueries.push(new URL(route.request().url()).searchParams);
    await route.fulfill({
      json: {
        data: journalEntries,
        meta: { page: 1, limit: 10, total: 3, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/journal-entries/*', async (route) => {
    journalEntryDetailRequests.push(route.request().url());
    await route.fulfill({ status: 404, json: { message: 'Not expected' } });
  });
  await page.route('**/api/v1/ledger/posting-accounts*', async (route) => {
    await route.fulfill({
      json: {
        data: accounts,
        meta: { page: 1, limit: 100, total: accounts.length, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/counterparties*', async (route) => {
    await route.fulfill({
      json: {
        data: counterparties,
        meta: {
          page: 1,
          limit: 100,
          total: counterparties.length,
          totalPages: 1,
        },
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

test('lists transactions at the index route and preserves creation routes', async ({
  page,
}) => {
  const journalQueries: URLSearchParams[] = [];
  const journalEntryDetailRequests: string[] = [];
  await registerRoutes(page, journalQueries, journalEntryDetailRequests);
  await signIn(page);

  await page.goto('/transactions');
  await expect(page).toHaveURL('/transactions');
  await expect(page.getByTestId('transactions-table')).toBeVisible();
  await expect(page.getByText('Payment to Osahon Oboite')).toBeVisible();
  await expect(page.getByText('Receipt from Acme Consulting')).toBeVisible();
  await expect(page.getByText('USD account → Main checking')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open transaction' })
  ).toHaveCount(3);

  await page.getByRole('button', { name: 'Open transaction' }).nth(0).click();
  let drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await expect(drawer.getByText('Outflow')).toBeVisible();
  await expect(drawer.getByText('Main checking')).toBeVisible();
  await expect(drawer.getByText('Gift')).toBeVisible();
  await drawer
    .getByRole('button', { name: 'Close transaction details' })
    .click();
  await expect(drawer).not.toBeVisible();

  await page.getByRole('button', { name: 'Open transaction' }).nth(1).click();
  drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await expect(drawer.getByText('Inflow')).toBeVisible();
  await expect(drawer.getByText('Professional services')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();

  await page.getByRole('button', { name: 'Open transaction' }).nth(2).click();
  drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await expect(drawer.getByText('Transfer', { exact: true })).toBeVisible();
  await expect(drawer.getByText('USD account')).toBeVisible();
  await expect(drawer.getByText('Main checking')).toBeVisible();
  await expect(drawer.getByText('1 USD = 1,590 NGN')).toBeVisible();
  await expect(drawer.getByText('Bank fees')).toBeVisible();
  await expect(drawer.getByText('International transfer charge')).toBeVisible();
  await page
    .locator('[data-slot="sheet-overlay"]')
    .click({ position: { x: 10, y: 10 } });
  await expect(drawer).not.toBeVisible();
  expect(journalEntryDetailRequests).toEqual([]);

  await expect.poll(() => journalQueries.length).toBeGreaterThan(0);
  expect(journalQueries[0].get('page')).toBe('1');
  expect(journalQueries[0].get('limit')).toBe('10');
  expect(journalQueries[0].get('orderBy')).toBe('effectiveDate');
  expect(journalQueries[0].get('sortDirection')).toBe('desc');

  await page.getByPlaceholder('Search transactions...').fill('gift');
  await page.getByRole('columnheader', { name: 'Date' }).click();
  await expect(page).toHaveURL(/q=gift/);
  await expect(page).toHaveURL(/order=asc/);
  await expect
    .poll(() => journalQueries.some((query) => query.get('search') === 'gift'))
    .toBe(true);

  await page.getByRole('link', { name: 'New transaction' }).click();
  await expect(page).toHaveURL('/transactions/inflow');
  await expect(page.getByRole('tab', { name: 'Inflow' })).toBeVisible();
});

test('dismisses archive confirmation without changing the transaction', async ({
  page,
}) => {
  const journalEntryRequests: string[] = [];
  await registerRoutes(page, [], journalEntryRequests);
  await signIn(page);
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Open transaction' }).first().click();

  const drawer = page.getByRole('dialog', { name: 'Transaction details' });

  const archiveButton = drawer.getByRole('button', {
    name: 'Archive',
    exact: true,
  });

  const confirmation = page.getByRole('alertdialog', {
    name: 'Archive this transaction?',
  });

  await archiveButton.click();
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toHaveAccessibleDescription(
    'Are you sure you want to archive this transaction?'
  );
  await expect(
    confirmation.getByRole('button', { name: 'Cancel' })
  ).toBeFocused();
  await confirmation.getByRole('button', { name: 'Cancel' }).click();
  await expect(confirmation).not.toBeVisible();
  await expect(archiveButton).toBeFocused();

  await archiveButton.click();
  await page.keyboard.press('Escape');
  await expect(confirmation).not.toBeVisible();
  await expect(drawer).toBeVisible();

  expect(journalEntryRequests).toEqual([]);

  await drawer
    .getByRole('button', { name: 'Close transaction details' })
    .click();
  await expect(page.getByText('Payment to Osahon Oboite')).toBeVisible();
  await page.getByRole('button', { name: 'Open transaction' }).first().click();
  await expect(drawer).toBeVisible();
  await expect(confirmation).not.toBeVisible();
});

test('requires typing delete before confirming transaction deletion', async ({
  page,
}) => {
  await registerRoutes(page, [], []);
  await signIn(page);
  let deleted = false;
  let requestCount = 0;
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    const data = deleted ? journalEntries.slice(1) : journalEntries;
    await route.fulfill({
      json: {
        data,
        meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/journal-entries/payment-1', async (route) => {
    requestCount += 1;
    expect(route.request().method()).toBe('DELETE');
    expect(route.request().postData()).toBeNull();
    deleted = true;
    await route.fulfill({ status: 204 });
  });
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Open transaction' }).first().click();

  const drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await drawer.getByRole('button', { name: 'Delete', exact: true }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Delete this transaction?',
  });

  const confirmationInput = confirmation.getByLabel('Type "delete" to confirm');

  const deleteButton = confirmation.getByRole('button', {
    name: 'Delete',
    exact: true,
  });

  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByText(
      'This action cannot be undone. Type delete below to confirm.'
    )
  ).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'Cancel' })
  ).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'Archive instead' })
  ).toBeVisible();
  await expect(deleteButton).toBeDisabled();

  await confirmationInput.fill('Delete');
  await expect(deleteButton).toBeDisabled();
  expect(requestCount).toBe(0);
  await confirmationInput.fill('delete');
  await expect(deleteButton).toBeEnabled();
  await deleteButton.click();

  await expect(confirmation).not.toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByText('Payment to Osahon Oboite')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open transaction' })
  ).toHaveCount(2);
  expect(requestCount).toBe(1);
});

test('keeps delete confirmation open when deletion fails', async ({ page }) => {
  await registerRoutes(page, [], []);
  await signIn(page);
  let requestCount = 0;
  await page.route('**/api/v1/journal-entries/payment-1', async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 400,
      json: {
        name: 'AuthenticationError',
        errorKey: 'auth_error_token_missing_unauthorized',
        validationErrors: [],
      },
    });
  });
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Open transaction' }).first().click();

  const drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await drawer.getByRole('button', { name: 'Delete', exact: true }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Delete this transaction?',
  });

  await confirmation.getByLabel('Type "delete" to confirm').fill('delete');
  await confirmation
    .getByRole('button', { name: 'Delete', exact: true })
    .click();

  await expect(page.getByText('Missing token.')).toBeVisible();
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'Delete', exact: true })
  ).toBeEnabled();
  await confirmation.getByRole('button', { name: 'Cancel' }).click();
  await expect(confirmation).not.toBeVisible();
  await expect(drawer).toBeVisible();
  expect(requestCount).toBe(1);
});

test('archives instead of deleting and returns to the refreshed transactions page', async ({
  page,
}) => {
  await registerRoutes(page, [], []);
  await signIn(page);
  let archived = false;
  let requestCount = 0;
  let releaseResponse = () => {};

  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });

  await page.route('**/api/v1/journal-entries?*', async (route) => {
    const data = archived ? journalEntries.slice(1) : journalEntries;
    await route.fulfill({
      json: {
        data,
        meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
      },
    });
  });
  await page.route(
    '**/api/v1/journal-entries/payment-1/archive',
    async (route) => {
      requestCount += 1;
      expect(route.request().method()).toBe('POST');
      expect(route.request().postData()).toBeNull();
      await responseGate;
      archived = true;
      await route.fulfill({
        json: { ...journalEntries[0], status: 'archived' },
      });
    }
  );
  await page.goto('/transactions?q=gift');
  await page.getByRole('button', { name: 'Open transaction' }).first().click();
  const drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await drawer.getByRole('button', { name: 'Delete', exact: true }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Delete this transaction?',
  });

  await confirmation
    .getByRole('button', { name: 'Archive instead', exact: true })
    .click();

  const pendingButton = confirmation.getByRole('button', {
    name: 'Archiving...',
  });

  await expect(pendingButton).toBeDisabled();
  await expect(pendingButton).toHaveAttribute('aria-busy', 'true');
  await expect(
    confirmation.getByRole('button', { name: 'Cancel' })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await expect(confirmation).toBeVisible();
  await expect.poll(() => requestCount).toBe(1);
  releaseResponse();
  await expect(page).toHaveURL('/transactions');
  await expect(confirmation).not.toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByText('Payment to Osahon Oboite')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open transaction' })
  ).toHaveCount(2);
  expect(requestCount).toBe(1);
  await page.getByRole('button', { name: 'Open transaction' }).first().click();
  await expect(drawer).toBeVisible();
  await expect(confirmation).not.toBeVisible();
});

test('closes archive confirmation on failure and shows the error', async ({
  page,
}) => {
  await registerRoutes(page, [], []);
  await signIn(page);
  let requestCount = 0;
  await page.route(
    '**/api/v1/journal-entries/payment-1/archive',
    async (route) => {
      requestCount += 1;
      if (requestCount === 1) {
        await route.fulfill({
          status: 400,
          json: {
            name: 'AuthenticationError',
            errorKey: 'auth_error_token_missing_unauthorized',
            validationErrors: [],
          },
        });

        return;
      }

      await route.fulfill({
        json: { ...journalEntries[0], status: 'archived' },
      });
    }
  );
  await page.goto('/transactions?q=gift');
  await page.getByRole('button', { name: 'Open transaction' }).first().click();
  const drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await drawer.getByRole('button', { name: 'Archive', exact: true }).click();

  const confirmation = page.getByRole('alertdialog', {
    name: 'Archive this transaction?',
  });

  await confirmation
    .getByRole('button', { name: 'Archive', exact: true })
    .click();
  await expect(page.getByText('Missing token.')).toBeVisible();
  await expect(confirmation).not.toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL('/transactions?q=gift');
  expect(requestCount).toBe(1);
});
