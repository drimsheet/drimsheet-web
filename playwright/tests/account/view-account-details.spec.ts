import type {
  IJournalEntryListDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import { registerAccountDashboardRoutes } from '@integration/mocks/account-dashboard';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const accountId = '00000000-0000-4000-8000-000000000020' as TEntityId;
const childId = '00000000-0000-4000-8000-000000000021' as TEntityId;
const endpoint = `**/api/v1/ledger/${accountId}`;
const flowEndpoint = `**/api/v1/reporting/accounts/${accountId}/cash-flow?*`;

const account: ILedgerAccountDto = {
  id: accountId,
  code: '100001',
  materializedPath: '100001',
  accountingEntityId: '00000000-0000-4000-8000-000000000002' as TEntityId,
  type: 'asset',
  subType: 'cash_and_cash_equivalent',
  behavior: 'bank',
  normalBalance: 'debit',
  isControlAccount: false,
  controlAccountId: '00000000-0000-4000-8000-000000000019' as TEntityId,
  name: 'Main business account',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: authenticatedUser.id,
  createdAt: '2026-01-14T12:00:00Z',
  updatedAt: '2026-10-12T12:00:00Z',
  balance: { amount: 245000000, currencyCode: 'NGN', isMinorUnit: true },
  functionalBalance: {
    amount: 2450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const child: ILedgerAccountDto = {
  ...account,
  id: childId,
  name: 'Payroll account',
  balance: { amount: 650000, currencyCode: 'NGN', isMinorUnit: false },
};

const transaction: IJournalEntryListDto = {
  id: 'entry-1',
  accountingEntityId: account.accountingEntityId,
  sourceType: 'receipt',
  memo: 'Customer payment',
  status: 'posted',
  effectiveDate: '2026-10-12T12:00:00Z',
  postedAt: account.updatedAt,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: account.createdBy,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  attachments: [],
  lines: [
    {
      id: 'line-1',
      entryId: 'entry-1',
      account: { id: 'sales', name: 'Sales' },
      counterparty: { id: 'customer-1', name: 'Acme Studio', status: 'active' },
      sequenceOrder: 1,
      amount: { amount: 35000000, currencyCode: 'NGN', isMinorUnit: true },
      functionalAmount: {
        amount: 350000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      exchangeRate: null,
      side: 'credit',
      description: 'Customer payment',
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    },
    {
      id: 'line-2',
      entryId: 'entry-1',
      account: { id: account.id, name: account.name },
      counterparty: null,
      sequenceOrder: 2,
      amount: { amount: 35000000, currencyCode: 'NGN', isMinorUnit: true },
      functionalAmount: {
        amount: 350000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      exchangeRate: null,
      side: 'debit',
      description: null,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    },
  ],
};

async function setup(
  page: Page,
  options: { bank?: boolean; children?: boolean; pettyCash?: boolean } = {}
) {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/currencies', (route) =>
    route.fulfill({
      json: [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
        { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
      ],
    })
  );
  await page.route(`${endpoint}/currency-update-eligibility`, (route) =>
    route.fulfill({ json: { canUpdateCurrency: true } })
  );
  await page.route(`${endpoint}/deletion-eligibility`, (route) =>
    route.fulfill({ json: { canDelete: false, reason: 'has_journal_entries' } })
  );
  for (const auth of ['login-with-email', 'refresh-access-token']) {
    await page.route(`**/api/v1/auth/${auth}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  }

  await page.route(endpoint, (route) =>
    route.fulfill({
      json: { ...account, behavior: options.pettyCash ? 'petty_cash' : 'bank' },
    })
  );
  await page.route(`${endpoint}/opening-balance`, (route) =>
    route.fulfill({ json: { openingBalance: null } })
  );
  await page.route(`${endpoint}/bank-details`, (route) => {
    if (options.bank === false)
      return route.fulfill({
        status: 500,
        json: {
          name: 'BankDetailsMissing',
          errorKey: 'ledger_error_bank_details_missing_unexpected',
        },
      });

    return route.fulfill({
      json: {
        bankName: 'Example Bank',
        accountName: 'Acme Studio Ltd',
        accountNumber: '0123456789',
        countryCode: 'NG',
      },
    });
  });
  await page.route(`${endpoint}/sub-accounts`, (route) =>
    route.fulfill({ json: options.children === false ? [] : [child] })
  );
  await page.route(flowEndpoint, (route) => {
    const query = new URL(route.request().url()).searchParams;
    const from = query.get('from')!;
    const to = query.get('to')!;

    return route.fulfill({
      json: {
        accountId,
        currencyCode: 'NGN',
        period: { from, to },
        totalMoneyIn: {
          amount: 120000000,
          currencyCode: 'NGN',
          isMinorUnit: true,
        },
        totalMoneyOut: {
          amount: 780000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        buckets: [
          {
            from,
            to,
            moneyIn: {
              amount: 120000000,
              currencyCode: 'NGN',
              isMinorUnit: true,
            },
            moneyOut: {
              amount: 780000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
          },
        ],
      },
    });
  });
  await page.route('**/api/v1/journal-entries?*', (route) => {
    const query = new URL(route.request().url()).searchParams;
    expect(query.get('accountId')).toBe(accountId);
    const pageNumber = Number(query.get('page'));

    return route.fulfill({
      json: {
        data: [
          {
            ...transaction,
            id: `transaction-${pageNumber}`,
            lines: transaction.lines.map((line) => ({
              ...line,
              account:
                line.sequenceOrder === 1
                  ? {
                      ...line.account,
                      name: pageNumber === 1 ? 'Sales' : 'Earlier sales',
                    }
                  : line.account,
            })),
          },
        ],
        meta: { page: pageNumber, limit: 5, total: 6, totalPages: 2 },
      },
    });
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test('loads account sections, changes the cash-flow period, pages transactions, and opens a child', async ({
  page,
}) => {
  await setup(page);
  let release!: () => void;

  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(endpoint, async (route) => {
    await responseGate;
    await route.fallback();
  });
  await page.goto(`/accounts/${accountId}`);
  for (const name of [
    'account summary',
    'bank details',
    'sub accounts',
    'transactions chart',
    'recent transactions',
  ]) {
    await expect(
      page.getByRole('status', { name: `Loading ${name}` })
    ).toBeVisible();
  }

  release();
  await expect(page.getByRole('heading', { name: account.name })).toBeVisible();
  await expect(page.getByText('Sales', { exact: true })).toBeVisible();
  await expect(page.getByRole('status', { name: /^Loading/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: account.name })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Bank Details', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Sub-accounts (1)', exact: true })
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('combobox', { name: 'Period' }).click();
  const selectedMonth = await page.getByRole('option').nth(1).textContent();

  const request = page.waitForRequest((req) =>
    req.url().includes('/cash-flow?')
  );

  await page.getByRole('option').nth(1).click();
  const query = new URL((await request).url()).searchParams;
  expect(query.get('from')).toMatch(/^\d{4}-\d{2}-01$/);
  expect(query.get('bucketDays')).toBe('7');
  await expect(page.getByRole('combobox', { name: 'Period' })).toHaveText(
    selectedMonth!
  );
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByText('Earlier sales')).toBeVisible();
  await expect(page.getByText('Sales', { exact: true })).toHaveCount(0);
  await page.route(`**/api/v1/ledger/${childId}`, (route) =>
    route.fulfill({ json: child })
  );
  await page.route(`**/api/v1/ledger/${childId}/sub-accounts`, (route) =>
    route.fulfill({ json: [] })
  );
  await page.route(`**/api/v1/ledger/${childId}/bank-details`, (route) =>
    route.fulfill({
      json: {
        bankName: 'Payroll Bank',
        accountName: 'Acme',
        accountNumber: '9876543210',
        countryCode: 'NG',
      },
    })
  );
  await page.route('**/api/v1/journal-entries?*', (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } },
    })
  );
  await page.route(
    `**/api/v1/reporting/accounts/${childId}/cash-flow?*`,
    (route) => route.fulfill({ status: 503, json: { errorKey: 'unavailable' } })
  );
  await page.getByRole('button', { name: 'Payroll account' }).click();
  await expect(page).toHaveURL(`/accounts/${childId}`);
  await expect(
    page.getByRole('heading', { name: 'Payroll account' })
  ).toBeVisible();
  await expect(page.getByText('Payroll Bank')).toBeVisible();
  await expect(page.getByText('No transactions yet.')).toBeVisible();
  await expect(page.getByText('Earlier sales')).toHaveCount(0);
});

test('petty cash skips the bank endpoint and retains other sections when cash flow fails', async ({
  page,
}) => {
  await setup(page, { pettyCash: true, children: false });
  let bankCalls = 0;
  await page.route(`${endpoint}/opening-balance`, (route) =>
    route.fulfill({ json: { openingBalance: null } })
  );
  await page.route(`${endpoint}/bank-details`, (route) => {
    bankCalls++;

    return route.abort();
  });
  await page.route(flowEndpoint, (route) =>
    route.fulfill({ status: 503, json: { errorKey: 'unavailable' } })
  );
  await page.goto(`/accounts/${accountId}`);
  const chart = page.getByRole('region', { name: 'Cash Flow' });
  await expect(chart.getByRole('alert')).toBeVisible();
  await expect(page.getByText('Sales', { exact: true })).toBeVisible();
  expect(bankCalls).toBe(0);
  await page.route(flowEndpoint, (route) =>
    route.fulfill({
      json: {
        accountId,
        currencyCode: 'NGN',
        period: { from: '2026-10-01', to: '2026-10-12' },
        totalMoneyIn: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
        totalMoneyOut: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
        buckets: [],
      },
    })
  );
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await expect(
    chart.getByText('No money moved during this period.')
  ).toBeVisible();
});

test('searches and sorts account transactions and opens the shared details drawer', async ({
  page,
}) => {
  await setup(page);
  await page.goto(`/accounts/${accountId}`);
  const recent = page.getByRole('region', { name: 'Recent transactions' });
  await recent.getByRole('button', { name: 'Open transaction' }).click();
  const drawer = page.getByRole('dialog', { name: 'Transaction details' });
  await expect(
    drawer.getByRole('listitem').getByText('Customer payment')
  ).toBeVisible();
  await expect(drawer.getByText('Sales', { exact: true })).toBeVisible();
  await drawer
    .getByRole('button', { name: 'Close transaction details' })
    .click();

  await recent.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(recent.getByText('Earlier sales')).toBeVisible();

  await page.route('**/api/v1/journal-entries?*', (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (query.get('sortDirection') !== 'asc') return route.fallback();

    expect(query.get('accountId')).toBe(accountId);

    return route.fulfill({
      json: {
        data: [
          {
            ...transaction,
            id: 'oldest',
            effectiveDate: '2026-01-01T10:00:00Z',
            lines: transaction.lines.map((line) => ({
              ...line,
              account:
                line.sequenceOrder === 1
                  ? { ...line.account, name: 'Oldest sale' }
                  : line.account,
            })),
          },
        ],
        meta: { page: 1, limit: 5, total: 6, totalPages: 2 },
      },
    });
  });

  const sortRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());

    return (
      url.pathname.endsWith('/journal-entries') &&
      url.searchParams.get('sortDirection') === 'asc'
    );
  });

  await recent.getByRole('button', { name: 'Sort by Date' }).click();
  const sortQuery = new URL((await sortRequest).url()).searchParams;
  expect(sortQuery.get('accountId')).toBe(accountId);
  expect(sortQuery.get('page')).toBe('1');
  expect(sortQuery.get('orderBy')).toBe('effectiveDate');
  await expect(recent.getByText('Oldest sale', { exact: true })).toBeVisible();

  await page.route('**/api/v1/journal-entries?*', (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (!query.get('search')) return route.fallback();

    expect(query.get('accountId')).toBe(accountId);
    expect(query.get('search')).toBe('Unmatched');
    expect(query.get('page')).toBe('1');
    expect(query.get('sortDirection')).toBe('asc');
    expect(query.get('orderBy')).toBe('effectiveDate');

    return route.fulfill({
      json: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } },
    });
  });
  const search = recent.getByRole('searchbox');
  await search.fill('Unmatched');
  await expect(recent.getByText('Oldest sale', { exact: true })).toHaveCount(0);
  await expect(search).toHaveValue('Unmatched');
  await search.clear();
  await expect(recent.getByText('Oldest sale', { exact: true })).toBeVisible();
});

test('archives a control account after cancellation and failure, blocking duplicate submits and later editing', async ({
  page,
}) => {
  await setup(page, { children: false });
  let current = { ...account, isControlAccount: true };
  const requests: { method: string; body: string | null }[] = [];
  let finishArchive: () => void = () => undefined;

  const archiveResponse = new Promise<void>((resolve) => {
    finishArchive = resolve;
  });

  await page.route(endpoint, (route) => route.fulfill({ json: current }));
  await page.route(`${endpoint}/archive`, async (route) => {
    requests.push({
      method: route.request().method(),
      body: route.request().postData(),
    });
    if (requests.length === 1) {
      await route.fulfill({ status: 500, json: { name: 'UnexpectedError' } });

      return;
    }

    await archiveResponse;
    current = { ...current, status: 'archived' };
    await route.fulfill({ status: 204 });
  });

  await page.goto(`/accounts/${accountId}`);
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeEnabled();
  const actions = page.getByRole('button', { name: 'Open account actions' });
  await actions.click();
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toHaveCount(0);
  await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Archive account?' });
  await expect(dialog).toContainText('This account and all its sub-accounts');
  await expect(dialog).toBeVisible();
  expect(requests).toEqual([]);
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).not.toBeVisible();
  expect(requests).toEqual([]);

  await actions.click();
  await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
  await dialog
    .getByRole('button', { name: 'Archive account', exact: true })
    .click();
  await test.step('Failure leaves the confirmation usable', async () => {
    await expect(
      page.getByText('An error occurred', { exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Archive account', exact: true })
    ).toBeEnabled();
    await expect(page.getByText('Active', { exact: true })).toBeVisible();
  });
  await dialog
    .getByRole('button', { name: 'Archive account', exact: true })
    .click();
  await expect(
    dialog.getByRole('button', { name: 'Archive account', exact: true })
  ).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect
    .poll(() => requests)
    .toEqual([
      { method: 'POST', body: null },
      { method: 'POST', body: null },
    ]);
  finishArchive();

  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Account archived successfully')).toBeVisible();
  await expect(page.getByText('Archived', { exact: true })).toBeVisible();
  await actions.click();
  await expect(
    page.getByRole('menuitem', { name: 'Archive', exact: true })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(
    page.getByText('Archived accounts cannot be edited.')
  ).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('blocks archiving header accounts and editing unsupported account types', async ({
  page,
}) => {
  await setup(page, { children: false });
  await page.route(endpoint, (route) =>
    route.fulfill({
      json: {
        ...account,
        controlAccountId: undefined,
        behavior: 'virtual_account',
      },
    })
  );
  await page.goto(`/accounts/${accountId}`);
  await page.getByRole('button', { name: 'Open account actions' }).click();
  await expect(
    page.getByRole('menuitem', { name: 'Archive', exact: true })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(
    page.getByText(
      'This account is not editable. Only bank and petty cash accounts can be edited.'
    )
  ).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('rechecks deletion permission, hides stale permission while pending, and recovers from a failed check', async ({
  page,
}) => {
  await setup(page);
  let checks = 0;
  let release!: () => void;

  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(endpoint + '/deletion-eligibility', async (route) => {
    checks += 1;
    if (checks === 2) await pending;

    if (checks === 3) {
      await route.fulfill({ status: 500, json: { name: 'UnexpectedError' } });

      return;
    }

    await route.fulfill({
      json:
        checks === 2
          ? { canDelete: false, reason: 'has_journal_entries' }
          : { canDelete: true },
    });
  });
  await page.goto('/accounts/' + accountId);
  const actions = page.getByRole('button', { name: 'Open account actions' });
  const remove = page.getByRole('menuitem', { name: 'Delete', exact: true });

  const loading = page.getByRole('status', {
    name: 'Checking deletion availability',
  });

  await expect(actions).toBeVisible();
  expect(checks).toBe(0);
  await actions.click();
  await expect(remove).toBeVisible();
  await page.keyboard.press('Escape');
  await actions.click();
  await expect(loading).toBeVisible();
  await expect(remove).toHaveCount(0);
  expect(checks).toBe(2);
  release();
  await expect(loading).toHaveCount(0);
  await expect(remove).toHaveCount(0);
  await page.keyboard.press('Escape');
  await actions.click();
  await expect(
    page.getByText(
      'Unable to check deletion availability. Reopen the menu to try again.'
    )
  ).toBeVisible();
  await expect(remove).toHaveCount(0);
  await page.keyboard.press('Escape');
  await actions.click();
  await expect(remove).toBeVisible();
  expect(checks).toBe(4);
});

test('confirms deletion, blocks duplicate submissions and returns to the refreshed accounts list', async ({
  page,
}) => {
  await setup(page, { children: false });
  const dashboard = await registerAccountDashboardRoutes(page);

  dashboard.rows = [account];

  const requests: { method: string; body: string | null }[] = [];
  let finishDelete: () => void = () => undefined;

  const response = new Promise<void>((resolve) => {
    finishDelete = resolve;
  });

  await page.route(`${endpoint}/currency-update-eligibility`, (route) =>
    route.fulfill({ json: { canUpdateCurrency: true } })
  );
  await page.route(`${endpoint}/deletion-eligibility`, (route) =>
    route.fulfill({ json: { canDelete: true } })
  );
  await page.route(endpoint, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fulfill({ json: account });

      return;
    }

    requests.push({
      method: route.request().method(),
      body: route.request().postData(),
    });
    await response;
    dashboard.rows = [];
    await route.fulfill({ status: 204 });
  });
  // Seed the list cache to verify that returning after deletion refreshes it.
  await page.goto('/accounts');
  await page
    .getByRole('table')
    .getByRole('button', { name: account.name, exact: true })
    .click();
  await expect(page).toHaveURL(`/accounts/${accountId}`);
  const actions = page.getByRole('button', { name: 'Open account actions' });
  await actions.click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete account?' });
  await expect(dialog).toContainText(account.name);
  await dialog.getByLabel('Type "delete" to confirm').fill('delete');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).not.toBeVisible();
  expect(requests).toEqual([]);
  await actions.click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const input = dialog.getByLabel('Type "delete" to confirm');
  await expect(input).toHaveValue('');
  await expect(
    dialog.getByRole('button', { name: 'Delete', exact: true })
  ).toBeDisabled();
  await input.fill('delete');
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: 'Delete', exact: true })
  ).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(input).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect.poll(() => requests).toEqual([{ method: 'DELETE', body: null }]);
  dashboard.accountQueries.length = 0;
  finishDelete();
  await expect(page).toHaveURL('/accounts');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Account deleted successfully')).toBeVisible();
  await expect(
    page.getByText('No accounts yet', { exact: true })
  ).toBeVisible();
  await expect
    .poll(() =>
      dashboard.accountQueries.some((query) => query.get('limit') === '10')
    )
    .toBe(true);
  await expect(
    page.getByRole('cell', { name: account.name, exact: true })
  ).toHaveCount(0);
});

test('retains the account and rechecks eligibility after deletion is rejected', async ({
  page,
}) => {
  await setup(page);
  let deleteRequests = 0;
  await page.route(`${endpoint}/currency-update-eligibility`, (route) =>
    route.fulfill({ json: { canUpdateCurrency: true } })
  );
  await page.route(`${endpoint}/deletion-eligibility`, (route) =>
    route.fulfill({
      json:
        deleteRequests === 0
          ? { canDelete: true }
          : { canDelete: false, reason: 'has_journal_entries' },
    })
  );
  await page.route(endpoint, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fallback();

      return;
    }

    deleteRequests += 1;
    await route.fulfill({
      status: 400,
      json: {
        name: 'InvalidError',
        errorKey: 'ledger_error_non_draft_account_deletion_invalid',
        validationErrors: [],
      },
    });
  });
  await page.goto(`/accounts/${accountId}`);
  const actions = page.getByRole('button', { name: 'Open account actions' });
  await actions.click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete account?' });
  await dialog.getByLabel('Type "delete" to confirm').fill('delete');
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(`/accounts/${accountId}`);
  await expect(page.getByRole('heading', { name: account.name })).toBeVisible();
  await expect(
    page.getByText(
      'This account cannot be deleted because it or one of its subaccounts has journal entries.'
    )
  ).toBeVisible();
  await actions.click();
  await expect(
    page.getByRole('status', { name: 'Checking deletion availability' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toHaveCount(0);
  expect(deleteRequests).toBe(1);
});

for (const behavior of ['petty_cash', 'bank'] as const) {
  test(`edits ${behavior} using its update endpoint and refreshes account details`, async ({
    page,
  }) => {
    await setup(page, {
      pettyCash: behavior === 'petty_cash',
      children: false,
    });
    let current = { ...account, behavior };

    let bankDetails = {
      countryCode: 'NG',
      bankName: 'Example Bank',
      accountName: 'Acme Studio Ltd',
      accountNumber: '0123456789',
    };

    const requests: unknown[] = [];
    let attempts = 0;
    await page.route(endpoint, (route) => route.fulfill({ json: current }));
    await page.route(`${endpoint}/bank-details`, (route) =>
      route.fulfill({ json: bankDetails })
    );
    await page.route('**/api/v1/banks*', (route) =>
      route.fulfill({
        json: [
          { countryCode: 'NG', bankCode: 'EXAMPLE', bankName: 'Example Bank' },
        ],
      })
    );
    await page.route(
      `**/api/v1/ledger/asset/${behavior === 'bank' ? 'bank' : 'petty-cash'}/${accountId}`,
      (route) => {
        expect(route.request().method()).toBe('PATCH');
        attempts += 1;
        if (attempts === 1)
          return route.fulfill({
            status: 500,
            json: { name: 'UnexpectedError' },
          });

        const request = route.request().postDataJSON();
        requests.push(request);
        current = {
          ...current,
          name: request.name ?? current.name,
          balance: {
            ...current.balance,
            currencyCode: request.currencyCode ?? current.balance.currencyCode,
          },
        };
        if (request.bankAccount)
          bankDetails = { ...bankDetails, ...request.bankAccount };

        return route.fulfill({ json: current });
      }
    );
    await page.goto(`/accounts/${accountId}`);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const dialog = page.getByRole('dialog', {
      name:
        behavior === 'bank' ? 'Edit bank account' : 'Edit petty cash account',
    });

    await expect(dialog.getByLabel('Account display name')).toHaveValue(
      account.name
    );
    await expect(dialog.getByLabel('Currency', { exact: true })).toHaveValue(
      'NGN'
    );
    await expect(
      dialog.getByRole('combobox', { name: 'Currency', exact: true })
    ).toBeEnabled();
    await expect(dialog.getByLabel('Create as a sub account')).toHaveCount(0);

    const skipBalance = dialog.getByRole('checkbox', {
      name: 'Leave opening balance unset',
    });

    await expect(skipBalance).not.toBeChecked();
    await expect(
      dialog.getByLabel('Opening balance', { exact: true })
    ).toBeEnabled();
    await skipBalance.check();
    await expect(dialog.getByText('Keep existing opening balance')).toHaveCount(
      0
    );
    await test.step('Failure retains the edit, while cancellation resets it', async () => {
      await dialog.getByLabel('Account display name').fill('Unsaved name');
      await dialog.getByRole('button', { name: 'Save changes' }).click();
      await expect(
        page.getByText('An error occurred', { exact: true })
      ).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Save changes' })
      ).toBeEnabled();
      await expect(dialog.getByLabel('Account display name')).toHaveValue(
        'Unsaved name'
      );
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(dialog.getByLabel('Account display name')).toHaveValue(
        account.name
      );
      await skipBalance.check();
    });
    await dialog.getByLabel('Account display name').fill('Updated account');
    if (behavior === 'bank') {
      await expect(dialog.getByLabel('Bank account name')).toHaveValue(
        'Acme Studio Ltd'
      );
      await dialog.getByLabel('Bank account name').fill('New holder');
    }

    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Updated account' })
    ).toBeVisible();
    await expect(page.getByText('Account updated successfully')).toBeVisible();
    expect(requests).toEqual([
      behavior === 'bank'
        ? {
            name: 'Updated account',
            bankAccount: {
              bankName: 'Example Bank',
              accountName: 'New holder',
              accountNumber: '0123456789',
            },
          }
        : { name: 'Updated account' },
    ]);
    if (behavior === 'bank')
      await expect(page.getByText('New holder', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(dialog.getByLabel('Account display name')).toHaveValue(
      'Updated account'
    );
    await skipBalance.check();
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    expect(requests).toHaveLength(1);
    await test.step('A later currency-only edit refreshes the saved currency', async () => {
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await dialog
        .getByRole('checkbox', { name: 'Leave opening balance unset' })
        .check();
      await dialog
        .getByRole('combobox', { name: 'Currency', exact: true })
        .fill('USD');
      await page.getByRole('option', { name: /US Dollar/ }).click();
      await dialog.getByRole('button', { name: 'Save changes' }).click();
      await expect(dialog).not.toBeVisible();
      expect(requests.at(-1)).toEqual({ currencyCode: 'USD' });
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(
        dialog.getByRole('combobox', { name: 'Currency', exact: true })
      ).toHaveValue('USD');
    });
  });
}

for (const behavior of ['petty_cash', 'bank'] as const) {
  test(`adds a first opening balance to ${behavior} and prevents dismissal while saving`, async ({
    page,
  }) => {
    await setup(page, {
      pettyCash: behavior === 'petty_cash',
      children: false,
    });
    await page.clock.setFixedTime(new Date('2026-10-13T12:00:00Z'));
    await page.route('**/api/v1/currencies/exchange-rates?*', (route) =>
      route.fulfill({ json: [] })
    );
    let finishUpdate: () => void = () => undefined;

    const response = new Promise<void>((resolve) => {
      finishUpdate = resolve;
    });

    const requests: unknown[] = [];
    await page.route(
      `**/api/v1/ledger/asset/${behavior === 'bank' ? 'bank' : 'petty-cash'}/${accountId}`,
      async (route) => {
        requests.push(route.request().postDataJSON());
        await response;
        await route.fulfill({ json: { ...account, behavior } });
      }
    );
    await page.goto(`/accounts/${accountId}`);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const dialog = page.getByRole('dialog', {
      name:
        behavior === 'bank' ? 'Edit bank account' : 'Edit petty cash account',
    });

    await expect(
      dialog.getByRole('checkbox', { name: 'Leave opening balance unset' })
    ).not.toBeChecked();
    await expect(
      dialog.getByLabel('Opening balance', { exact: true })
    ).toBeEnabled();
    await expect(
      dialog.getByLabel('Opening date', { exact: true })
    ).toBeEnabled();
    await dialog.getByLabel('Opening balance', { exact: true }).fill('');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog.getByText('Opening balance is required')).toBeVisible();
    expect(requests).toEqual([]);
    await dialog
      .getByRole('combobox', { name: 'Currency', exact: true })
      .fill('USD');
    await page.getByRole('option', { name: /US Dollar/ }).click();
    await dialog.getByLabel('Opening balance', { exact: true }).fill('500');
    await expect(
      dialog.getByText('Opening balance is required')
    ).not.toBeVisible();
    await dialog.getByRole('button', { name: 'Opening date' }).click();
    await page
      .getByRole('button', { name: 'Thursday, October 1st, 2026', exact: true })
      .click();
    await dialog.getByLabel('Exchange rate', { exact: true }).fill('1500');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect.poll(() => requests.length).toBe(1);
    expect(requests).toEqual([
      {
        currencyCode: 'USD',
        openingBalance: {
          amount: { amount: 500, currencyCode: 'USD', isMinorUnit: false },
          date: '2026-10-01',
          exchangeRate: {
            baseCurrencyCode: 'USD',
            targetCurrencyCode: 'NGN',
            rate: 1500,
            type: 'market',
            asOf: '2026-10-01',
            source: 'manual',
          },
        },
      },
    ]);
    finishUpdate();
    await expect(dialog).not.toBeVisible();
  });
}

test('recovers a failed bank-details load after refreshing before editing', async ({
  page,
}) => {
  await setup(page, { children: false });
  await page.route('**/api/v1/banks*', (route) => route.fulfill({ json: [] }));
  await page.goto(`/accounts/${accountId}`);
  await expect(
    page.getByText('Acme Studio Ltd', { exact: true })
  ).toBeVisible();
  let reads = 0;
  await page.route(`${endpoint}/opening-balance`, (route) =>
    route.fulfill({ json: { openingBalance: null } })
  );
  await page.route(`${endpoint}/bank-details`, (route) => {
    reads += 1;

    return reads === 1
      ? route.fulfill({ status: 500, json: { name: 'UnexpectedError' } })
      : route.fulfill({
          json: {
            countryCode: 'NG',
            bankName: 'Example Bank',
            accountName: 'Acme Studio Ltd',
            accountNumber: '0123456789',
          },
        });
  });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit bank account' });
  await expect(dialog.getByRole('alert')).toContainText(
    'Unable to load bank details. Refresh the page to try again.'
  );
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(dialog.getByLabel('Bank account name')).toHaveValue(
    'Acme Studio Ltd'
  );
});

for (const behavior of ['petty_cash', 'bank'] as const) {
  test(`fails closed on a ${behavior} opening-balance read error, then preserves a loaded zero balance`, async ({
    page,
  }) => {
    await setup(page, {
      pettyCash: behavior === 'petty_cash',
      children: false,
    });
    const requests: unknown[] = [];
    await page.route(
      `**/api/v1/ledger/asset/${behavior === 'bank' ? 'bank' : 'petty-cash'}/${accountId}`,
      (route) => {
        const request = route.request().postDataJSON();
        requests.push(request);

        return route.fulfill({
          json: { ...account, behavior, name: request.name },
        });
      }
    );
    await page.route(`${endpoint}/currency-update-eligibility`, (route) =>
      route.fulfill({
        json: {
          canUpdateCurrency: false,
          reason: 'has_posted_journal_entries',
        },
      })
    );
    let reads = 0;
    await page.route(`${endpoint}/opening-balance`, (route) => {
      reads += 1;
      if (reads === 1)
        return route.fulfill({
          status: 500,
          json: { name: 'UnexpectedError' },
        });

      return route.fulfill({
        json: {
          openingBalance: {
            amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
            date: '2026-10-01T00:00:00Z',
            exchangeRate: null,
          },
        },
      });
    });
    await page.goto(`/accounts/${accountId}`);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog');

    await expect(dialog.getByRole('alert')).toContainText(
      'Unable to load the opening balance'
    );
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toHaveCount(0);
    await page.reload();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const openingBalanceToggle = dialog.getByRole('checkbox');

    await expect(openingBalanceToggle).toHaveCount(0);
    await expect(
      dialog.getByLabel('Opening balance', { exact: true })
    ).toHaveValue('0');
    await expect(
      dialog.getByLabel('Opening date', { exact: true })
    ).toContainText('1 Oct 2026');
    await expect(
      dialog.getByLabel('Opening balance', { exact: true })
    ).toBeDisabled();
    await expect(
      dialog.getByLabel('Currency', { exact: true })
    ).toHaveAttribute('readonly', '');
    await expect(
      dialog.getByLabel('Opening date', { exact: true })
    ).toBeDisabled();
    await dialog.getByLabel('Account display name').fill('Renamed account');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    expect(requests).toEqual([{ name: 'Renamed account' }]);
  });
}

for (const behavior of ['petty_cash', 'bank'] as const) {
  test(`uses currency eligibility to lock ${behavior} without an opening balance and rechecks on reopening`, async ({
    page,
  }) => {
    await setup(page, {
      pettyCash: behavior === 'petty_cash',
      children: false,
    });
    let eligible = true;
    let reads = 0;
    let finishRead: () => void = () => undefined;

    const response = new Promise<void>((resolve) => {
      finishRead = resolve;
    });

    await page.route(
      `${endpoint}/currency-update-eligibility`,
      async (route) => {
        reads += 1;
        if (reads === 1) {
          await route.fulfill({
            status: 500,
            json: { name: 'UnexpectedError' },
          });

          return;
        }

        if (!eligible) await response;

        await route.fulfill({
          json: eligible
            ? { canUpdateCurrency: true }
            : {
                canUpdateCurrency: false,
                reason: 'has_posted_journal_entries',
              },
        });
      }
    );
    const requests: unknown[] = [];
    await page.route(
      `**/api/v1/ledger/asset/${behavior === 'bank' ? 'bank' : 'petty-cash'}/${accountId}`,
      (route) => {
        requests.push(route.request().postDataJSON());

        return route.fulfill({
          json: { ...account, behavior, name: 'Renamed account' },
        });
      }
    );
    await page.goto(`/accounts/${accountId}`);
    const edit = page.getByRole('button', { name: 'Edit', exact: true });
    await edit.click();
    const dialog = page.getByRole('dialog');
    await test.step('Eligibility errors fail closed until refresh', async () => {
      await expect(dialog.getByRole('alert')).toContainText(
        'Unable to check whether the currency can be updated. Refresh the page to try again.'
      );
      await expect(
        dialog.getByRole('combobox', { name: 'Currency', exact: true })
      ).toHaveCount(0);
      await expect(
        dialog.getByRole('button', { name: 'Save changes' })
      ).toHaveCount(0);
      await page.reload();
      await edit.click();
    });
    await expect(
      dialog.getByRole('combobox', { name: 'Currency', exact: true })
    ).toBeEnabled();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    eligible = false;
    await edit.click();
    await expect.poll(() => reads).toBe(3);
    await expect(dialog.getByRole('status')).toBeVisible();
    await expect(
      dialog.getByRole('combobox', { name: 'Currency', exact: true })
    ).toHaveCount(0);
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toHaveCount(0);
    finishRead();
    await expect(
      dialog.getByLabel('Currency', { exact: true })
    ).toHaveAttribute('readonly', '');
    await expect(
      dialog.getByLabel('Opening balance', { exact: true })
    ).toBeEnabled();
    await dialog
      .getByRole('checkbox', { name: 'Leave opening balance unset' })
      .check();
    await dialog.getByLabel('Account display name').fill('Renamed account');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    expect(requests).toEqual([{ name: 'Renamed account' }]);
  });
}
