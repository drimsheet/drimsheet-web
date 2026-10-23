import type {
  IAccountCounterpartyParticipationDto,
  IJournalEntryListDto,
  ILedgerAccountDto,
  IRevenueExpenseAccountDto,
  IRevenueExpenseSummaryDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const accountId = '00000000-0000-4000-8000-000000000040' as TEntityId;
const money = { amount: 2400000, currencyCode: 'NGN', isMinorUnit: false };

const category: ILedgerAccountDto = {
  id: accountId,
  accountingEntityId: '00000000-0000-4000-8000-000000000002' as TEntityId,
  code: '500001',
  materializedPath: '500001',
  type: 'expense',
  normalBalance: 'debit',
  subType: 'admin_and_general',
  behavior: 'admin_and_general',
  isControlAccount: false,
  name: 'Software & subscriptions',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: authenticatedUser.id,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  balance: money,
  functionalBalance: money,
};

function journal(
  id: string,
  counterparty: string,
  amount: number
): IJournalEntryListDto {
  return {
    id,
    accountingEntityId: category.accountingEntityId,
    sourceType: 'expense',
    memo: `${counterparty} subscription`,
    status: 'posted',
    effectiveDate: '2026-10-01T00:00:00Z',
    postedAt: '2026-10-01T00:00:00Z',
    voidedAt: null,
    voidingEntryId: null,
    createdBy: authenticatedUser.id,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    attachments: [],
    lines: [
      {
        id: `${id}-line`,
        entryId: id,
        account: { id: accountId, name: category.name },
        counterparty: {
          id: counterparty,
          name: counterparty,
          status: 'active',
        },
        sequenceOrder: 1,
        amount: { ...money, amount },
        functionalAmount: { ...money, amount },
        side: 'debit',
        exchangeRate: null,
        description: null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    ],
  };
}

const entries = [
  journal('google', 'Google', 1800000),
  journal('notion', 'Notion', 600000),
  {
    ...journal('draft', 'Figma', 100000),
    status: 'draft' as const,
    postedAt: null,
  },
];

const participation: IAccountCounterpartyParticipationDto[] = [
  'Google',
  'Notion',
].map((name, index) => ({
  counterparty: {
    id: name,
    name,
    accountingEntityId: category.accountingEntityId,
    createdBy: authenticatedUser.id,
    status: 'active',
    type: 'organization',
    roles: ['vendor'],
    meta: {},
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  },
  isSelf: false,
  participation: {
    totalShare: index === 0 ? 60 : 40,
    amount: { ...money, amount: index === 0 ? 1440000 : 960000 },
    functionalAmount: { ...money, amount: index === 0 ? 1440000 : 960000 },
  },
}));

const participationUrl = `**/api/v1/reporting/accounts/${accountId}/counterparty-participation?*`;

async function setup(page: Page, type: 'revenue' | 'expense' = 'expense') {
  await page.clock.setFixedTime(new Date('2026-10-15T12:00:00Z'));
  await registerAuthenticatedAppRoutes(page);
  for (const auth of ['login-with-email', 'refresh-access-token']) {
    await page.route(`**/api/v1/auth/${auth}`, (route) =>
      route.fulfill({ json: { accessToken: 'integration-test-token' } })
    );
  }

  await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
    route.fulfill({ json: { ...category, type } })
  );
  await page.route(`**/api/v1/ledger/${accountId}/sub-accounts`, (route) =>
    route.fulfill({ json: [] })
  );
  await page.route(
    `**/api/v1/ledger/${accountId}/deletion-eligibility`,
    (route) =>
      route.fulfill({
        json: { canDelete: false, reason: 'has_journal_entries' },
      })
  );
  await page.route('**/api/v1/journal-entries?*', (route) => {
    const params = new URL(route.request().url()).searchParams;
    expect(params.get('accountId')).toBe(accountId);
    const pageNumber = Number(params.get('page'));
    const data = pageNumber === 1 ? entries.slice(0, 1) : entries.slice(1);

    return route.fulfill({
      json: {
        data: data.map((entry) => ({
          ...entry,
          lines: entry.lines.map((line) => ({
            ...line,
            side: type === 'revenue' ? 'credit' : 'debit',
          })),
        })),
        meta: { page: pageNumber, limit: 100, totalPages: 2, total: 3 },
      },
    });
  });
  await page.route(participationUrl, (route) =>
    route.fulfill({
      json: {
        data: participation,
        meta: { page: 1, limit: 5, total: 2, totalPages: 1 },
      },
    })
  );
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test('loads every page for analytics, filters transactions by counterparty, and fits mobile', async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`/categories/${accountId}`);
  await expect(
    page.getByRole('heading', { name: category.name })
  ).toBeVisible();
  await expect(page.getByText('₦2,400,000', { exact: true })).toBeVisible();
  const share = page.getByRole('region', { name: 'Counterparty share' });
  await expect(share.getByRole('button', { name: /Google/ })).toContainText(
    '60%'
  );
  await expect(share.getByRole('button', { name: /Notion/ })).toContainText(
    '40%'
  );
  await expect(share.getByRole('button', { name: /Figma/ })).toHaveCount(0);
  const table = page.getByRole('region', { name: 'Transactions', exact: true });
  await expect(
    table.getByText('3 transactions', { exact: true })
  ).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Expense over time' })
      .locator('.recharts-bar')
  ).toHaveCount(1);
  await page.screenshot({
    path: testInfo.outputPath('category-desktop.png'),
    fullPage: true,
  });
  await share.getByRole('button', { name: /Notion/ }).click();
  await expect(table.getByText('Notion subscription')).toBeVisible();
  await expect(table.getByText('Google subscription')).toHaveCount(0);
  await expect(table.getByText('1 transaction', { exact: true })).toBeVisible();
  await table.getByRole('button', { name: 'Clear filter: Notion' }).click();
  await expect(table.getByText('Google subscription')).toBeVisible();
  await table
    .getByRole('textbox', { name: 'Search transactions…' })
    .fill('Figma');
  await expect(table.getByText('Figma subscription')).toBeVisible();
  await expect(table.getByText('Google subscription')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('category-mobile.png'),
    fullPage: true,
  });
});

test('redirects existing revenue account links to the category detail page', async ({
  page,
}) => {
  await setup(page, 'revenue');
  await page.goto(`/accounts/${accountId}`);
  await expect(page).toHaveURL(`/categories/${accountId}`);
  await expect(
    page.getByRole('region', { name: 'Revenue over time' })
  ).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Counterparty share' })
      .getByRole('button', { name: /Google/ })
  ).toContainText('60%');
});

test('keeps the balance visible while history loads, fails, and retries to an empty state', async ({
  page,
}) => {
  await setup(page);
  let release = () => {};

  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/api/v1/journal-entries?*', async (route) => {
    if (new URL(route.request().url()).searchParams.get('page') === '1') {
      await route.fulfill({
        json: {
          data: entries.slice(0, 1),
          meta: { page: 1, limit: 100, total: 3, totalPages: 2 },
        },
      });

      return;
    }

    await gate;
    await route.fulfill({ status: 503, json: { errorKey: 'unavailable' } });
  });
  await page.goto(`/categories/${accountId}`);
  await expect(page.getByLabel('Loading transaction count')).toBeVisible();
  await expect(page.getByText('₦2,400,000', { exact: true })).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Counterparty share' })
  ).toBeVisible();
  await expect(page.getByLabel('Loading transaction count')).toHaveCount(0);
  await page.route('**/api/v1/journal-entries?*', (route) =>
    route.fulfill({
      json: {
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      },
    })
  );
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page
      .getByRole('region', { name: 'Counterparty share' })
      .getByRole('button', { name: /Google/ })
  ).toContainText('60%');
  await expect(
    page.getByText('No net posted activity in the last 6 months.')
  ).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Transactions', exact: true })
      .getByText('0 transactions')
  ).toBeVisible();
});

test('pages server participation while preserving the transaction filter', async ({
  page,
}) => {
  await setup(page);
  await page.route(participationUrl, (route) => {
    const params = new URL(route.request().url()).searchParams;
    const pageNumber = Number(params.get('page'));
    expect(params.get('limit')).toBe('5');
    const data = [participation[pageNumber - 1]];

    return route.fulfill({
      json: {
        data,
        meta: {
          page: pageNumber,
          limit: 5,
          total: 6,
          totalPages: 2,
        },
      },
    });
  });
  await page.goto(`/categories/${accountId}`);
  const share = page.getByRole('region', { name: 'Counterparty share' });
  const table = page.getByRole('region', { name: 'Transactions', exact: true });
  await expect(share.getByRole('button', { name: /Google/ })).toContainText(
    '60%'
  );
  await share.getByRole('button', { name: 'Next counterparties' }).click();
  await expect(share.getByRole('button', { name: /Notion/ })).toContainText(
    '40%'
  );
  await expect(share.getByText('Page 2 of 2')).toBeVisible();
  await share.getByRole('button', { name: /Notion/ }).click();
  await expect(
    table.getByRole('button', { name: 'Clear filter: Notion' })
  ).toBeVisible();
  await share.getByRole('button', { name: 'Previous counterparties' }).click();
  await expect(share.getByRole('button', { name: /Google/ })).toContainText(
    '60%'
  );
  await expect(
    table.getByRole('button', { name: 'Clear filter: Notion' })
  ).toBeVisible();
  await table.getByRole('button', { name: 'Clear filter: Notion' }).click();
  await expect(
    table.getByText('3 transactions', { exact: true })
  ).toBeVisible();
});

test('keeps transactions usable when participation fails and retries the share card', async ({
  page,
}) => {
  await setup(page);
  await page.route(participationUrl, (route) =>
    route.fulfill({ status: 503, json: { errorKey: 'unavailable' } })
  );
  await page.goto(`/categories/${accountId}`);
  const share = page.getByRole('region', { name: 'Counterparty share' });
  await expect(share.getByRole('alert')).toBeVisible();
  await expect(share.getByText('No counterparty activity yet.')).toHaveCount(0);
  await expect(
    page
      .getByRole('region', { name: 'Transactions', exact: true })
      .getByText('Google subscription')
  ).toBeVisible();
  await page.route(participationUrl, (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } },
    })
  );
  await share.getByRole('button', { name: 'Try again' }).click();
  await expect(share.getByText('No counterparty activity yet.')).toBeVisible();
});

for (const type of ['revenue', 'expense'] as const) {
  test(`edits a ${type} category and refreshes its details`, async ({
    page,
  }) => {
    await setup(page, type);
    let current = { ...category, type };
    const updates: unknown[] = [];

    await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
      route.fulfill({ json: current })
    );
    await page.route(`**/api/v1/ledger/${type}/${accountId}`, (route) => {
      expect(route.request().method()).toBe('PATCH');
      updates.push(route.request().postDataJSON());
      current = { ...current, name: 'Updated category' };

      return route.fulfill({ json: current });
    });
    await page.goto(`/categories/${accountId}`);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit category' });
    await expect(dialog.getByLabel('Category name')).toHaveValue(category.name);
    await dialog.getByLabel('Category name').fill('Discarded name');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    expect(updates).toEqual([]);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(dialog.getByLabel('Category name')).toHaveValue(category.name);
    await dialog.getByLabel('Category name').fill('  Updated category  ');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    expect(updates).toEqual([{ name: 'Updated category' }]);
    await expect(
      page.getByRole('heading', { name: 'Updated category' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(dialog.getByLabel('Category name')).toHaveValue(
      'Updated category'
    );
  });
}

test('retains category edits after a failed save and allows retry', async ({
  page,
}) => {
  await setup(page);
  let current = category;
  let attempts = 0;
  let release = () => {};

  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
    route.fulfill({ json: current })
  );
  await page.route(`**/api/v1/ledger/expense/${accountId}`, async (route) => {
    attempts += 1;
    expect(route.request().postDataJSON()).toEqual({
      name: 'Updated category',
    });
    if (attempts === 1) {
      await gate;
      await route.fulfill({ status: 503, json: { errorKey: 'unavailable' } });

      return;
    }

    current = { ...category, name: 'Updated category' };
    await route.fulfill({ json: current });
  });
  await page.goto(`/categories/${accountId}`);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit category' });
  await dialog.getByLabel('Category name').fill('Updated category');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByLabel('Category name')).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  release();
  await expect(dialog.getByRole('alert')).toContainText(
    'We couldn’t save this category'
  );
  await expect(dialog.getByLabel('Category name')).toHaveValue(
    'Updated category'
  );
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Updated category' })
  ).toBeVisible();
  expect(attempts).toBe(2);
});

test('disables editing and archiving an archived category', async ({
  page,
}) => {
  await setup(page);
  await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
    route.fulfill({ json: { ...category, status: 'archived' } })
  );
  await page.goto(`/categories/${accountId}`);
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Open category actions' }).click();
  await expect(
    page.getByRole('menuitem', { name: 'Archive', exact: true })
  ).toBeDisabled();
});

for (const type of ['revenue', 'expense'] as const) {
  test(`confirms archiving a ${type} category and refreshes its status`, async ({
    page,
  }, testInfo) => {
    await setup(page, type);
    let current = { ...category, type };
    const requests: { method: string; body: string | null }[] = [];
    let finishArchive = () => {};

    const archiveResponse = new Promise<void>((resolve) => {
      finishArchive = resolve;
    });

    await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
      route.fulfill({ json: current })
    );
    await page.route(`**/api/v1/ledger/${accountId}/archive`, async (route) => {
      requests.push({
        method: route.request().method(),
        body: route.request().postData(),
      });
      await archiveResponse;
      current = { ...current, status: 'archived' };
      await route.fulfill({ status: 204 });
    });
    await page.goto(`/categories/${accountId}`);
    const actions = page.getByRole('button', { name: 'Open category actions' });
    await actions.click();
    await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Archive category' });
    await expect(dialog).toContainText(`Archive ${category.name}?`);
    await expect(dialog).toContainText(
      'Its historical activity will remain available.'
    );
    expect(requests).toEqual([]);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    expect(requests).toEqual([]);
    await actions.click();
    await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
    await expect(page.getByRole('menu')).not.toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('category-archive.png'),
      animations: 'disabled',
    });
    await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: 'Archiving…' })
    ).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(
      page.getByRole('button', {
        name: 'Open category actions',
        includeHidden: true,
      })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', {
        name: 'Edit',
        exact: true,
        includeHidden: true,
      })
    ).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect.poll(() => requests).toEqual([{ method: 'POST', body: null }]);
    finishArchive();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText('Category archived successfully')
    ).toBeVisible();
    await expect(page.getByText('Archived', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: category.name })
    ).toBeVisible();
    await expect(page.getByText('₦2,400,000', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Edit', exact: true })
    ).toBeDisabled();
    await actions.click();
    await expect(
      page.getByRole('menuitem', { name: 'Archive', exact: true })
    ).toBeDisabled();
    expect(requests).toHaveLength(1);
  });
}

test('retains category archive confirmation after failure and retries', async ({
  page,
}) => {
  await setup(page);
  let current = category;
  let attempts = 0;

  await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
    route.fulfill({ json: current })
  );
  await page.route(`**/api/v1/ledger/${accountId}/archive`, async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 500,
        json: { name: 'UnexpectedError', validationErrors: [] },
      });

      return;
    }

    current = { ...category, status: 'archived' };
    await route.fulfill({ status: 204 });
  });
  await page.goto(`/categories/${accountId}`);
  await page.getByRole('button', { name: 'Open category actions' }).click();
  await page.getByRole('menuitem', { name: 'Archive', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Archive category' });
  await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(
    page.getByText('An error occurred', { exact: true })
  ).toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(page.getByText('Active', { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Archive', exact: true })
  ).toBeEnabled();
  await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Archived', { exact: true })).toBeVisible();
  expect(attempts).toBe(2);
});

test('checks deletion eligibility on menu open and hides stale permission while rechecking', async ({
  page,
}) => {
  await setup(page);
  let checks = 0;
  let finishCheck = () => {};

  const response = new Promise<void>((resolve) => {
    finishCheck = resolve;
  });

  await page.route(
    `**/api/v1/ledger/${accountId}/deletion-eligibility`,
    async (route) => {
      checks += 1;
      if (checks > 1) await response;

      await route.fulfill({ json: { canDelete: checks === 1 } });
    }
  );
  await page.goto(`/categories/${accountId}`);
  const actions = page.getByRole('button', { name: 'Open category actions' });
  await expect(actions).toBeVisible();
  expect(checks).toBe(0);
  await actions.click();
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await actions.click();
  await expect(
    page.getByRole('status', { name: 'Checking deletion availability' })
  ).toBeVisible();
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toHaveCount(0);
  finishCheck();
  await expect(
    page.getByRole('status', { name: 'Checking deletion availability' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toHaveCount(0);
  expect(checks).toBe(2);
});

test('retries failed category deletion eligibility when reopening the menu', async ({
  page,
}) => {
  await setup(page);
  let checks = 0;

  await page.route(
    `**/api/v1/ledger/${accountId}/deletion-eligibility`,
    (route) => {
      checks += 1;

      return checks === 1
        ? route.fulfill({ status: 500, json: { name: 'UnexpectedError' } })
        : route.fulfill({ json: { canDelete: true } });
    }
  );
  await page.goto(`/categories/${accountId}`);
  const actions = page.getByRole('button', { name: 'Open category actions' });
  await actions.click();
  await expect(
    page.getByText(
      'Unable to check deletion availability. Reopen the menu to try again.'
    )
  ).toBeVisible();
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toHaveCount(0);
  await page.keyboard.press('Escape');
  await actions.click();
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toBeVisible();
  expect(checks).toBe(2);
});

for (const status of ['active', 'archived'] as const) {
  test(`deletes an eligible ${status} category and refreshes the categories list`, async ({
    page,
  }, testInfo) => {
    await setup(page);
    let deleted = false;
    let detailReadsAfterDelete = 0;
    const requests: { method: string; body: string | null }[] = [];
    let finishDelete = () => {};

    const response = new Promise<void>((resolve) => {
      finishDelete = resolve;
    });

    const row: IRevenueExpenseAccountDto = {
      accountId,
      accountName: category.name,
      code: category.code,
      type: 'expense',
      subType: category.subType,
      status,
      amount: money,
      sharePercentage: 100,
      transactionCount: 0,
    };

    const emptySection = {
      total: { ...money, amount: 0 },
      previousTotal: { ...money, amount: 0 },
      percentageChange: null,
      accounts: [],
    };

    const summary: IRevenueExpenseSummaryDto = {
      currencyCode: 'NGN',
      period: { from: '2026-10-01', to: '2026-10-15' },
      comparisonPeriod: { from: '2026-09-16', to: '2026-09-30' },
      revenue: emptySection,
      expenses: emptySection,
      suspense: { amount: { ...money, amount: 0 }, transactionCount: 0 },
    };

    await page.route('**/api/v1/reporting/revenue-expense-summary?*', (route) =>
      route.fulfill({ json: summary })
    );
    await page.route(
      '**/api/v1/reporting/revenue-expense-accounts?*',
      (route) =>
        route.fulfill({
          json: {
            data: deleted ? [] : [row],
            meta: {
              page: 1,
              limit: 10,
              total: deleted ? 0 : 1,
              totalPages: deleted ? 0 : 1,
            },
          },
        })
    );
    await page.route(
      `**/api/v1/ledger/${accountId}/deletion-eligibility`,
      (route) => route.fulfill({ json: { canDelete: true } })
    );
    await page.route(`**/api/v1/ledger/${accountId}`, async (route) => {
      if (route.request().method() !== 'DELETE') {
        if (deleted) detailReadsAfterDelete += 1;

        await route.fulfill({ json: { ...category, status } });

        return;
      }

      requests.push({
        method: route.request().method(),
        body: route.request().postData(),
      });
      await response;
      deleted = true;
      await route.fulfill({ status: 204 });
    });
    await page.goto('/categories');
    await page
      .getByRole('button', { name: category.name, exact: true })
      .click();
    await expect(page).toHaveURL(`/categories/${accountId}`);
    const actions = page.getByRole('button', { name: 'Open category actions' });
    await actions.click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete category?' });
    const input = dialog.getByLabel('Type "delete" to confirm');
    await expect(dialog).toContainText(category.name);
    await expect(dialog).toContainText('cannot be undone');
    await input.fill('delete');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    expect(requests).toEqual([]);
    await actions.click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    await expect(input).toHaveValue('');
    const confirm = dialog.getByRole('button', { name: 'Delete', exact: true });
    await expect(confirm).toBeDisabled();
    await input.fill('DELETE');
    await expect(confirm).toBeDisabled();
    await input.fill('delete');
    await expect(confirm).toBeEnabled();
    await expect(page.getByRole('menu')).not.toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('delete-category.png'),
      animations: 'disabled',
    });
    await confirm.click();
    await expect(
      dialog.getByRole('button', { name: 'Deleting…' })
    ).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(input).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => requests)
      .toEqual([{ method: 'DELETE', body: null }]);
    finishDelete();
    await expect(page).toHaveURL('/categories');
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Category deleted successfully')).toBeVisible();
    await expect(
      page.getByText('No categories found', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: category.name, exact: true })
    ).toHaveCount(0);
    expect(requests).toHaveLength(1);
    expect(detailReadsAfterDelete).toBe(0);
  });
}

test('retains the category and rechecks eligibility after deletion fails', async ({
  page,
}) => {
  await setup(page);
  let attempts = 0;

  await page.route(
    `**/api/v1/ledger/${accountId}/deletion-eligibility`,
    (route) => route.fulfill({ json: { canDelete: attempts === 0 } })
  );
  await page.route(`**/api/v1/ledger/${accountId}`, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fallback();

      return;
    }

    attempts += 1;
    await route.fulfill({
      status: 500,
      json: { name: 'UnexpectedError', validationErrors: [] },
    });
  });
  await page.goto(`/categories/${accountId}`);
  const actions = page.getByRole('button', { name: 'Open category actions' });
  await actions.click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete category?' });
  await dialog.getByLabel('Type "delete" to confirm').fill('delete');
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(`/categories/${accountId}`);
  await expect(
    page.getByRole('heading', { name: category.name })
  ).toBeVisible();
  await expect(
    page.getByText('An error occurred', { exact: true })
  ).toBeVisible();
  await actions.click();
  await expect(
    page.getByRole('status', { name: 'Checking deletion availability' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true })
  ).toHaveCount(0);
  expect(attempts).toBe(1);
});
