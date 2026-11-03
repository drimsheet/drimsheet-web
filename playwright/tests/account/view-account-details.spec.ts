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
import { registerReportingIntervalRoutes } from '@integration/mocks/reporting-interval';
import type { Page } from '@playwright/test';

test.use({ authenticated: true });

const accountId = '00000000-0000-4000-8000-000000000020' as TEntityId;
const childId = '00000000-0000-4000-8000-000000000021' as TEntityId;
const endpoint = `**/api/v1/ledger/${accountId}`;
const flowEndpoint = `**/api/v1/reporting/ledger/accounts/${accountId}/cash-flow?*`;

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
  await registerReportingIntervalRoutes(page);
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

  await page.route(endpoint, (route) =>
    route.fulfill({
      json: { ...account, behavior: options.pettyCash ? 'petty_cash' : 'bank' },
    })
  );
  await page.route(`${endpoint}/opening-balance`, (route) =>
    route.fulfill({ json: { openingBalance: null } })
  );
  await page.route(`${endpoint}/bank-details`, (route) => {
    if (options.bank === false) {
      return route.fulfill({
        status: 500,
        json: {
          name: 'BankDetailsMissing',
          errorKey: 'ledger_error_bank_details_missing_unexpected',
        },
      });
    }

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
}

test('loads account sections and coordinates the cash-flow period', async ({
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
    page
      .locator('dl')
      .filter({ has: page.getByText('Example Bank', { exact: true }) })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Sub-accounts (1)', exact: true })
  ).toBeVisible();
  const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' });
  await expect(
    breadcrumb.getByRole('link', { name: 'Accounts' })
  ).toHaveAttribute('href', '/accounts');
  await expect(breadcrumb.getByText(account.name)).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('heading', { level: 2 })
  ).toHaveText(['Overview', 'Recent transactions']);
  await expect(page.getByRole('main').getByRole('heading')).toHaveText([
    'Overview',
    account.name,
    'Sub-accounts (1)',
    'Recent transactions',
  ]);

  const overview = page
    .locator('dl')
    .filter({ has: page.getByText('Current balance', { exact: true }) });

  const bank = page
    .locator('dl')
    .filter({ has: page.getByText('Example Bank', { exact: true }) });

  await expect
    .poll(async () => {
      const balanceBounds = await overview.boundingBox();
      const bankBounds = await bank.boundingBox();

      return (
        balanceBounds &&
        bankBounds &&
        Math.abs(balanceBounds.y - bankBounds.y) < 2 &&
        bankBounds.x > balanceBounds.x
      );
    })
    .toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    )
    .toBe(true);
  const balanceBounds = await overview.boundingBox();
  const bankBounds = await bank.boundingBox();
  expect(bankBounds!.y).toBeGreaterThan(
    balanceBounds!.y + balanceBounds!.height
  );

  let releaseFlow!: () => void;

  const flowGate = new Promise<void>((resolve) => {
    releaseFlow = resolve;
  });

  await page.route(flowEndpoint, async (route) => {
    await flowGate;
    const query = new URL(route.request().url()).searchParams;
    const from = query.get('from');
    const to = query.get('to');
    await route.fulfill({
      json: {
        accountId,
        currencyCode: 'NGN',
        period: { from, to },
        totalMoneyIn: {
          amount: 432000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        totalMoneyOut: {
          amount: 123000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        buckets: [
          {
            from,
            to,
            moneyIn: {
              amount: 432000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            moneyOut: {
              amount: 123000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
          },
        ],
      },
    });
  });

  const periodSelector = page.getByRole('button', {
    name: 'Interval',
    exact: true,
  });

  await periodSelector.click();
  await page
    .getByRole('radio', { name: 'September 2026', exact: true })
    .click();

  const request = page.waitForRequest((req) =>
    req.url().includes('/cash-flow?')
  );

  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(
    page.getByRole('status', { name: 'Loading transactions chart' })
  ).toBeVisible();
  await expect(periodSelector).toBeFocused();
  releaseFlow();
  await expect(
    page.getByRole('status', { name: 'Loading transactions chart' })
  ).toHaveCount(0);
  await expect(periodSelector).toBeFocused();
  const query = new URL((await request).url()).searchParams;
  expect(query.get('from')).toBe('2026-09-01');
  expect(query.get('to')).toBe('2026-09-30');
  expect(query.get('bucketDays')).toBe('3');
  await expect(periodSelector).toHaveText(/September 2026/);
  await expect(
    page.getByRole('definition').filter({ hasText: '₦432,000' })
  ).toBeVisible();
  await expect(
    page.getByRole('definition').filter({ hasText: '₦123,000' })
  ).toBeVisible();
  await expect(page.getByText('Sales', { exact: true })).toBeVisible();
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
  const chart = page.getByRole('region', { name: 'Overview', exact: true });
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

  const plot = chart.getByRole('region', {
    name: 'Money in and money out by date',
  });

  await expect(plot).toBeVisible();
  await expect(
    chart.getByText('No money moved during this period.')
  ).toHaveCount(0);
});

test('archives an account while protecting the pending dialog and refreshes its host status', async ({
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
  await dialog
    .getByRole('button', { name: 'Archive account', exact: true })
    .click();
  await expect(
    dialog.getByRole('button', { name: 'Archive account', exact: true })
  ).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect.poll(() => requests).toEqual([{ method: 'POST', body: null }]);
  finishArchive();

  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Account archived successfully')).toBeVisible();
  await expect(page.getByText('Archived', { exact: true })).toBeVisible();
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

    let finishUpdate!: () => void;

    const updateGate = new Promise<void>((resolve) => {
      finishUpdate = resolve;
    });

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
      async (route) => {
        await updateGate;
        const request = route.request().postDataJSON();
        current = {
          ...current,
          name: request.name ?? current.name,
          balance: {
            ...current.balance,
            currencyCode: request.currencyCode ?? current.balance.currencyCode,
          },
        };
        if (request.bankAccount) {
          bankDetails = { ...bankDetails, ...request.bankAccount };
        }

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

    const skipBalance = dialog.getByRole('checkbox', {
      name: 'Leave opening balance unset',
    });

    await skipBalance.check();
    await dialog.getByLabel('Account display name').fill('Updated account');
    if (behavior === 'bank') {
      await expect(dialog.getByLabel('Bank account name')).toHaveValue(
        'Acme Studio Ltd'
      );
      await dialog.getByLabel('Bank account name').fill('New holder');
    }

    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      dialog.getByRole('button', { name: 'Save changes' })
    ).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    finishUpdate();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Updated account' })
    ).toBeVisible();
    await expect(page.getByText('Account updated successfully')).toBeVisible();
    if (behavior === 'bank') {
      await expect(page.getByText('New holder', { exact: true })).toBeVisible();
    }
  });
}
