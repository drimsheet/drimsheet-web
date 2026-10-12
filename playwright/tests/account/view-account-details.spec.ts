import type {
  IJournalEntryListDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
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

for (const state of [
  { bank: true, children: true },
  { bank: true, children: false },
  { bank: false, children: true },
  { bank: false, children: false },
]) {
  test(`bank details ${state.bank}, sub-accounts ${state.children}`, async ({
    page,
  }, testInfo) => {
    await setup(page, state);
    await page.goto(`/accounts/${accountId}`);
    await expect(
      page.getByRole('heading', { name: account.name })
    ).toBeVisible();
    await expect(page.getByText('Created 14 January 2026')).toBeVisible();
    await expect(page.getByText(/₦2,450,000/)).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Recent transactions' })
        .getByRole('table')
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Bank Details', exact: true })
    ).toHaveCount(state.bank ? 1 : 0);
    await expect(
      page.getByRole('region', { name: 'Sub-accounts (1)', exact: true })
    ).toHaveCount(state.children ? 1 : 0);
    await expect(
      page.getByText('Bank details haven’t been added.')
    ).toHaveCount(state.bank ? 0 : 1);

    const chart = page.getByRole('region', {
      name: 'Cash Flow',
      exact: true,
    });

    await expect(chart.getByText(/₦1,200,000/)).toBeVisible();
    await expect(chart.locator('.recharts-bar')).toHaveCount(2);
    const chartTop = (await chart.boundingBox())!.y;
    if (state.bank)
      expect(
        (await page
          .getByRole('region', { name: 'Bank Details' })
          .boundingBox())!.y
      ).toBeLessThan(chartTop);

    if (state.children)
      expect(
        (await page
          .getByRole('region', { name: 'Sub-accounts (1)' })
          .boundingBox())!.y
      ).toBeLessThan(chartTop);

    if (state.bank && state.children) {
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(
        page.getByRole('heading', { name: account.name })
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath('account-details-mobile.png'),
        fullPage: true,
      });
    }
  });
}

test('changes the cash-flow period, paginates transactions, and opens a sub-account', async ({
  page,
}) => {
  await setup(page);
  await page.goto(`/accounts/${accountId}`);
  await expect(page.getByRole('heading', { name: account.name })).toBeVisible();
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
  await page.getByRole('link', { name: '2', exact: true }).click();
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
  await chart.getByRole('button', { name: 'Try again' }).click();
  await expect(
    chart.getByText('No money moved during this period.')
  ).toBeVisible();
});

test('shows each loading skeleton until its data is available', async ({
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

  await recent.getByRole('link', { name: '2', exact: true }).click();
  await expect(recent.getByText('Earlier sales')).toBeVisible();

  const sortRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());

    return (
      url.pathname.endsWith('/journal-entries') &&
      url.searchParams.get('sortDirection') === 'asc'
    );
  });

  await recent.getByRole('columnheader', { name: 'Date' }).click();
  const sortQuery = new URL((await sortRequest).url()).searchParams;
  expect(sortQuery.get('accountId')).toBe(accountId);
  expect(sortQuery.get('page')).toBe('1');
  expect(sortQuery.get('orderBy')).toBe('effectiveDate');
  await expect(recent.getByText('Sales', { exact: true })).toBeVisible();

  await page.route('**/api/v1/journal-entries?*', (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (!query.get('search')) return route.fallback();

    expect(query.get('accountId')).toBe(accountId);
    expect(query.get('search')).toBe('Unmatched');
    expect(query.get('page')).toBe('1');

    return route.fulfill({
      json: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } },
    });
  });
  const search = recent.getByRole('searchbox');
  await search.fill('Unmatched');
  await expect(recent.getByText('Sales', { exact: true })).toHaveCount(0);
  await expect(search).toHaveValue('Unmatched');
  await search.clear();
  await expect(recent.getByText('Sales', { exact: true })).toBeVisible();
});
