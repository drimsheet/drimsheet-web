import type {
  IAccountActivityByTypesDto,
  ICurrentTotalBalanceByTypeDto,
  IFiscalYear,
  ILedgerTotalDebitsAndCreditsByCurrencyDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedAccountingEntity,
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
  const fiscalYearId = '00000000-0000-4000-8000-000000000004' as TEntityId;
  const period = { from: '2026-01-01', to: '2026-12-31' };

  await page.route(
    '**/api/v1/accounting/fiscal-years/current',
    async (route) => {
      await route.fulfill({
        json: {
          id: fiscalYearId,
          createdBy: authenticatedUser.id,
          name: '2026',
          status: 'open',
          accountingEntityId: authenticatedAccountingEntity.id,
          startDate: `${period.from}T00:00:00.000Z`,
          endDate: `${period.to}T23:59:59.999Z`,
          closedAt: null,
          updatedAt: timestamp,
        } satisfies IFiscalYear,
      });
    }
  );
  await page.route(
    '**/api/v1/reporting/ledger/current-total-balance-by-type?*',
    async (route) => {
      await route.fulfill({
        json: {
          totalFunctionalBalance: money(0, 'NGN'),
        } satisfies ICurrentTotalBalanceByTypeDto,
      });
    }
  );
  await page.route(
    '**/api/v1/reporting/ledger/ledger-total-debits-and-credits-by-currency?*',
    async (route) => {
      await route.fulfill({
        json: {
          fiscalYearId,
          period,
          totalsByCurrency: [],
        } satisfies ILedgerTotalDebitsAndCreditsByCurrencyDto,
      });
    }
  );
  await page.route(
    '**/api/v1/reporting/ledger/account-activity-by-types?*',
    async (route) => {
      const query = new URL(route.request().url()).searchParams;
      await route.fulfill({
        json: {
          currencyCode: 'NGN',
          period: { from: query.get('from')!, to: query.get('to')! },
          buckets: [],
        } satisfies IAccountActivityByTypesDto,
      });
    }
  );
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

test('lists all transactions with applied filters and preserves creation routes', async ({
  page,
}) => {
  const journalQueries: URLSearchParams[] = [];
  const detailRequests: string[] = [];
  await registerRoutes(page, journalQueries, detailRequests);
  await page.route('**/api/v1/ledger?*', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    let data = accounts.filter((account) => account.id.startsWith('cash-'));
    if (query.get('type') === 'revenue') {
      data = accounts.filter((account) => account.id === 'services');
    } else if (query.get('type') === 'expense') {
      data = accounts.filter((account) =>
        ['bank-fees', 'gift'].includes(account.id)
      );
    }

    await route.fulfill({
      json: {
        data: data.map((account) => ({
          ...account,
          balance: money(0, account.id === 'cash-usd' ? 'USD' : 'NGN'),
        })),
        meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
      },
    });
  });
  await page.route('**/api/v1/journal-entries?*', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    journalQueries.push(query);
    const sourceType = query.get('sourceType');
    const accountId = query.get('accountId');
    const search = query.get('search');

    let data = journalEntries.filter(
      (item) =>
        (!sourceType || item.sourceType === sourceType) &&
        (!accountId ||
          item.lines.some((line) => line.account.id === accountId)) &&
        (!search ||
          item.lines.some((line) =>
            line.account.name.toLowerCase().includes(search.toLowerCase())
          ))
    );

    if (
      query.get('orderBy') === 'createdAt' &&
      query.get('sortDirection') === 'asc'
    ) {
      data = [...data].reverse();
    }

    const currentPage = Number(query.get('page') ?? 1);
    const total = data.length;
    // Use a small server page to exercise the real pagination composition.
    data = data.slice((currentPage - 1) * 2, currentPage * 2);
    await route.fulfill({
      json: {
        data,
        meta: {
          page: currentPage,
          limit: 2,
          total,
          totalPages: Math.ceil(total / 2),
        },
      },
    });
  });
  await signIn(page);
  await page.goto('/transactions/list');
  await expect(
    page.getByRole('heading', { name: 'All transactions' })
  ).toBeVisible();
  await expect(page.getByText('Payment to Osahon Oboite')).toBeVisible();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('USD account → Main checking')).toBeVisible();
  await page.getByRole('button', { name: 'Sort by Recorded On' }).click();
  await expect(page.getByRole('table').getByRole('row').nth(1)).toContainText(
    'USD account → Main checking'
  );
  await expect
    .poll(() => Object.fromEntries(journalQueries.at(-1)!))
    .toMatchObject({
      page: '1',
      limit: '25',
      orderBy: 'createdAt',
      sortDirection: 'asc',
    });

  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const popover = page.getByRole('dialog', { name: 'Filters', exact: true });
  await page.clock.setFixedTime(new Date('2026-10-29T12:00:00Z'));
  await popover.getByLabel('From', { exact: true }).click();
  await page
    .getByRole('button', { name: /Thursday, October 1st, 2026/ })
    .click();
  await expect(popover).toBeVisible();
  await expect(popover.getByLabel('From', { exact: true })).toBeFocused();

  await popover.getByRole('button', { name: 'Account', exact: true }).click();

  const accountInput = page.getByRole('combobox', {
    name: 'Account',
    exact: true,
  });

  await accountInput.fill('Main');
  await page
    .getByRole('option', { name: 'Main checking', exact: true })
    .click();
  await expect(popover).toBeVisible();
  await popover
    .getByRole('button', { name: 'Transaction type', exact: true })
    .click();
  await popover
    .getByRole('combobox', { name: 'Transaction type', exact: true })
    .click();
  await page.getByRole('option', { name: 'Inflow', exact: true }).click();
  expect(journalQueries.at(-1)!.has('sourceType')).toBe(false);
  await popover
    .getByRole('button', { name: 'Apply filters', exact: true })
    .click();
  await expect(popover).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeFocused();
  await expect(page.getByText('Receipt from Acme Consulting')).toBeVisible();
  await expect(page.getByText('Payment to Osahon Oboite')).not.toBeVisible();
  await expect
    .poll(() => Object.fromEntries(journalQueries.at(-1)!))
    .toMatchObject({
      page: '1',
      limit: '25',
      sourceType: 'receipt',
      effectiveDateFrom: '2026-10-01',
      accountId: 'cash-main',
      orderBy: 'createdAt',
      sortDirection: 'asc',
    });
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.keyboard.press('Escape');
  await expect(popover).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeFocused();

  await page.getByRole('button', { name: 'Open transaction' }).click();
  const drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await expect(drawer.getByText('Inflow', { exact: true })).toBeVisible();
  await expect(drawer.getByText('Professional services')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open transaction' })
  ).toBeFocused();
  expect(detailRequests).toEqual([]);

  await page.getByRole('button', { name: /^Filters/ }).click();
  await popover.getByRole('button', { name: 'Clear all' }).click();
  await popover.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.getByText('USD account → Main checking')).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Search transactions…' })
    .fill('gift');
  await expect(page.getByText('Payment to Osahon Oboite')).toBeVisible();
  await expect(
    page.getByText('Receipt from Acme Consulting')
  ).not.toBeVisible();
  await expect
    .poll(() => Object.fromEntries(journalQueries.at(-1)!))
    .toEqual({
      page: '1',
      limit: '25',
      search: 'gift',
      orderBy: 'createdAt',
      sortDirection: 'asc',
    });

  await page.getByRole('textbox', { name: 'Search transactions…' }).fill('');
  await expect(page.getByText('USD account → Main checking')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(1280);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /^Filters/ }).click();
  await expect(popover).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390);
  await expect(
    popover.getByRole('button', { name: 'Apply filters' })
  ).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(popover).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeFocused();
  await page
    .getByRole('button', { name: 'Add new transaction', exact: true })
    .click();
  await expect(page).toHaveURL('/transactions/inflow');
  await expect(
    page.getByRole('radio', { name: 'Inflow', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('radio', { name: 'Inflow', exact: true })
  ).toBeChecked();
  await page.getByRole('radio', { name: 'Outflow', exact: true }).click();
  await expect(page).toHaveURL('/transactions/outflow');
  await expect(
    page.getByRole('radio', { name: 'Outflow', exact: true })
  ).toBeChecked();
  await page.getByRole('radio', { name: 'Transfer', exact: true }).click();
  await expect(page).toHaveURL('/transactions/transfer');
  await expect(
    page.getByRole('radio', { name: 'Transfer', exact: true })
  ).toBeChecked();
  await page
    .getByRole('navigation', { name: 'breadcrumb' })
    .getByRole('link', { name: 'Transactions', exact: true })
    .click();
  await expect(page).toHaveURL('/transactions');
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
  await expect(page.getByText('Missing token.')).toBeVisible();
  await expect(confirmation).toBeVisible();
  await expect(deleteButton).toBeEnabled();
  await expect(confirmationInput).toHaveValue('delete');
  await deleteButton.click();

  await expect(confirmation).not.toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByText('Payment to Osahon Oboite')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open transaction' })
  ).toHaveCount(2);
  expect(requestCount).toBe(2);
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
    name: 'Archive instead',
    exact: true,
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

test('cancels archive, handles a failed request, and accepts a later explicit submission', async ({
  page,
}) => {
  await registerRoutes(page, [], []);
  await signIn(page);
  let requestCount = 0;
  let archived = false;
  await page.route('**/api/v1/journal-entries?*', (route) => {
    const data = archived ? journalEntries.slice(1) : journalEntries;

    return route.fulfill({
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

      archived = true;
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

  await test.step('Cancellation does not mutate and restores focus', async () => {
    await confirmation.getByRole('button', { name: 'Cancel' }).click();
    await expect(confirmation).not.toBeVisible();
    await expect(
      drawer.getByRole('button', { name: 'Archive', exact: true })
    ).toBeFocused();
    expect(requestCount).toBe(0);
    await drawer.getByRole('button', { name: 'Archive', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(confirmation).not.toBeVisible();
    await drawer.getByRole('button', { name: 'Archive', exact: true }).click();
  });
  await confirmation
    .getByRole('button', { name: 'Archive', exact: true })
    .click();
  await expect(page.getByText('Missing token.')).toBeVisible();
  await expect(confirmation).not.toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL('/transactions?q=gift');
  expect(requestCount).toBe(1);
  await page.getByRole('button', { name: 'Open transaction' }).first().click();
  await drawer.getByRole('button', { name: 'Archive', exact: true }).click();
  await confirmation
    .getByRole('button', { name: 'Archive', exact: true })
    .click();
  await expect(confirmation).not.toBeVisible();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL('/transactions');
  expect(requestCount).toBe(2);
  await expect(page.getByText('Payment to Osahon Oboite')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open transaction' })
  ).toHaveCount(2);
});
