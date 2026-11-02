import type {
  IAccountBalanceContributionsByCounterpartyDto,
  IJournalEntryListDto,
  ILedgerAccountDto,
  IRevenueAndExpenseActivitySummaryDto,
  IRevenueExpenseAndSuspenseAccountBalanceDto,
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

const participation: IAccountBalanceContributionsByCounterpartyDto[] = [
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

const participationUrl = `**/api/v1/reporting/ledger/accounts/${accountId}/balance-contributions-by-counterparty?*`;

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
    expect(params.get('limit')).toBe('10');
    expect(params.get('page')).toBe('1');
    const pageNumber = Number(params.get('page'));
    const status = params.get('status');

    const matching = entries.filter(
      (entry) => !status || entry.status === status
    );

    const isRecent = params.get('limit') === '10';

    const scoped = matching.filter(
      (entry) =>
        !isRecent ||
        (entry.effectiveDate.slice(0, 10) >= params.get('effectiveDateFrom')! &&
          entry.effectiveDate.slice(0, 10) <= params.get('effectiveDateTo')!)
    );

    let data = matching.slice(1);
    if (pageNumber === 1) {
      data = matching.slice(0, 1);
    }

    if (isRecent) {
      data = scoped.slice(0, 10);
    }

    return route.fulfill({
      json: {
        data: data.map((entry) => ({
          ...entry,
          lines: entry.lines.map((line) => ({
            ...line,
            side: type === 'revenue' ? 'credit' : 'debit',
          })),
        })),
        meta: {
          page: pageNumber,
          limit: 100,
          totalPages: isRecent ? 1 : 2,
          total: isRecent ? scoped.length : matching.length,
        },
      },
    });
  });
  await page.route(
    `**/api/v1/reporting/ledger/accounts/${accountId}/activity?*`,
    (route) => {
      const params = new URL(route.request().url()).searchParams;
      expect(params.get('bucketDays')).toBe('1');
      const from = params.get('from')!;
      const to = params.get('to')!;
      const amount = from === '2025-01-01' ? 0 : 2400000;
      const delta = { ...money, amount };

      const buckets = amount
        ? [
            {
              from: '2026-10-01',
              to: '2026-10-01',
              delta,
              totalDebits: delta,
              totalCredits: { ...money, amount: 0 },
            },
          ]
        : [];

      if (from === '2026-01-01') {
        buckets.push({
          from: '2026-04-01',
          to: '2026-04-01',
          delta: { ...money, amount: 100000 },
          totalDebits: { ...money, amount: 100000 },
          totalCredits: { ...money, amount: 0 },
        });
      }

      return route.fulfill({
        json: { accountId, currencyCode: 'NGN', period: { from, to }, buckets },
      });
    }
  );
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

test('applies the page period to totals, charts and transactions', async ({
  page,
}) => {
  await setup(page);

  const historical = {
    ...journal('older', 'Older vendor', 100000),
    effectiveDate: '2026-04-01',
  };

  const recentRequests: string[] = [];
  await page.route('**/api/v1/journal-entries?*', (route) => {
    const params = new URL(route.request().url()).searchParams;
    expect(params.get('limit')).toBe('10');
    const recent = params.get('limit') === '10';

    let data = [
      ...entries.filter((entry) => entry.status === 'posted'),
      historical,
    ];

    if (recent) {
      expect(params.get('page')).toBe('1');
      expect(params.get('orderBy')).toBe('effectiveDate');
      expect(params.get('sortDirection')).toBe('desc');
      recentRequests.push(params.get('effectiveDateFrom')!);
      data = data.filter(
        (entry) =>
          entry.effectiveDate.slice(0, 10) >=
            params.get('effectiveDateFrom')! &&
          entry.effectiveDate.slice(0, 10) <= params.get('effectiveDateTo')!
      );
    }

    return route.fulfill({
      json: {
        data,
        meta: {
          page: 1,
          limit: recent ? 10 : 100,
          total: recent && data.length ? 11 : data.length,
          totalPages: recent && data.length ? 2 : 1,
        },
      },
    });
  });
  const ranges: string[] = [];
  await page.route(participationUrl, (route) => {
    const params = new URL(route.request().url()).searchParams;
    const from = params.get('from');
    const to = params.get('to');
    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('5');
    expect(from).toBeTruthy();
    expect(to).toBe(from === '2025-01-01' ? '2025-12-31' : '2026-10-15');
    ranges.push(`${from}:${to}`);
    let data = participation;
    if (from === '2025-01-01') {
      data = [];
    }

    if (from === '2026-01-01') {
      data = [
        ...participation,
        {
          ...participation[0],
          counterparty: {
            ...participation[0].counterparty!,
            id: 'older',
            name: 'Older vendor',
          },
        },
      ];
    }

    return route.fulfill({
      json: {
        data,
        meta: { page: 1, limit: 5, total: data.length, totalPages: 1 },
      },
    });
  });
  await page.goto(`/categories/${accountId}`);

  const heading = page.getByRole('heading', {
    name: category.name,
    exact: true,
  });

  await expect(heading).toBeVisible();

  const breadcrumb = page.getByRole('navigation', {
    name: 'breadcrumb',
    exact: true,
  });

  const headerLayout = await heading.evaluate((element) => {
    const header = element.closest('header')!;
    const rows = [...header.children];

    return {
      gap: getComputedStyle(header).rowGap,
      rows: rows.length,
      first: rows[0].getBoundingClientRect().x,
      second: rows[1].getBoundingClientRect().x,
    };
  });

  expect(headerLayout.gap).toBe('16px');
  expect(headerLayout.rows).toBe(3);
  expect(headerLayout.first).toBe(headerLayout.second);
  const breadcrumbBox = await breadcrumb.boundingBox();
  const headingBox = await heading.boundingBox();
  expect(headingBox!.x).toBe(breadcrumbBox!.x);
  const summary = page.getByLabel(category.name, { exact: true });

  const share = page.getByRole('region', {
    name: 'Share by person or business',
  });

  await expect(
    summary.getByRole('definition').filter({ hasText: /^11$/ })
  ).toBeVisible();
  await expect(share.getByRole('button', { name: /Google/ })).toContainText(
    '60%'
  );
  await expect(page.getByText('Older vendor subscription')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Overview', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Recent transactions', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Search transactions…' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'View all transactions' })
  ).toHaveAttribute(
    'href',
    `/transactions/list?accountId=${accountId}&effectiveDateFrom=2026-05-01&effectiveDateTo=2026-10-15`
  );
  await expect(summary.getByText('₦2,400,000', { exact: true })).toBeVisible();
  const period = page.getByRole('combobox', { name: 'Period' });
  await period.click();
  await page.getByRole('option', { name: 'This year', exact: true }).click();
  await expect(
    summary.getByRole('definition').filter({ hasText: /^11$/ })
  ).toBeVisible();
  await expect(summary.getByText('₦2,500,000', { exact: true })).toBeVisible();
  await expect(page.getByText('Older vendor subscription')).toBeVisible();
  await expect(
    share.getByRole('button', { name: /Older vendor/ })
  ).toBeVisible();
  await period.click();
  await page.getByRole('option', { name: 'Last year', exact: true }).click();
  await expect(
    summary.getByRole('definition').filter({ hasText: /^0$/ })
  ).toBeVisible();
  await expect(
    page.getByText('No expenses or income in this period.')
  ).toBeVisible();
  await expect(
    share.getByText('No person or business activity in this period.')
  ).toBeVisible();
  await expect(page.getByText('Google subscription')).toHaveCount(0);
  await period.click();
  await page.getByRole('option', { name: 'This month', exact: true }).click();
  await expect(page.getByText('Google subscription')).toBeVisible();
  await expect
    .poll(() => ranges)
    .toEqual([
      '2026-05-01:2026-10-15',
      '2026-01-01:2026-10-15',
      '2025-01-01:2025-12-31',
      '2026-10-01:2026-10-15',
    ]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    .toBe(true);
});

test('shows unavailable period totals on reporting failure and recovers after refresh', async ({
  page,
}) => {
  await setup(page);
  const url = `**/api/v1/reporting/ledger/accounts/${accountId}/activity?*`;
  await page.route(url, (route) =>
    route.fulfill({ status: 503, json: { errorKey: 'unavailable' } })
  );
  await page.goto(`/categories/${accountId}`);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(
    page
      .getByLabel(category.name, { exact: true })
      .getByRole('definition')
      .filter({ hasText: '—' })
  ).toHaveCount(1);
  await expect(page.getByText('Google subscription')).toBeVisible();
  await page.unroute(url);
  await page.route(url, (route) =>
    route.fulfill({
      json: {
        accountId,
        currencyCode: 'NGN',
        period: { from: '2026-05-01', to: '2026-10-15' },
        buckets: [],
      },
    })
  );
  await page.reload();
  await expect(
    page.getByText('No expenses or income in this period.')
  ).toBeVisible();
  await expect(page.getByText('Google subscription')).toBeVisible();
});

for (const type of ['revenue', 'expense'] as const) {
  test(`edits a ${type} category and refreshes its details`, async ({
    page,
  }) => {
    await setup(page, type);
    let current = { ...category, type };
    const updates: unknown[] = [];
    let attempts = 0;

    await page.route(`**/api/v1/ledger/${accountId}`, (route) =>
      route.fulfill({ json: current })
    );
    await page.route(`**/api/v1/ledger/${type}/${accountId}`, (route) => {
      expect(route.request().method()).toBe('PATCH');
      attempts += 1;
      if (type === 'expense' && attempts === 1) {
        return route.fulfill({
          status: 503,
          json: { errorKey: 'unavailable' },
        });
      }

      updates.push(route.request().postDataJSON());
      current = { ...current, name: 'Updated category' };

      return route.fulfill({ json: current });
    });
    await page.goto(
      type === 'revenue' ? `/accounts/${accountId}` : `/categories/${accountId}`
    );
    await expect(page).toHaveURL(`/categories/${accountId}`);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit category' });
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
      category.name
    );
    await dialog.getByLabel('Name', { exact: true }).fill('Discarded name');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    expect(updates).toEqual([]);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
      category.name
    );
    await dialog
      .getByLabel('Name', { exact: true })
      .fill('  Updated category  ');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    if (type === 'expense') {
      await expect(dialog.getByRole('alert')).toContainText(
        'We couldn’t save this category'
      );
      await expect(
        dialog.getByRole('button', { name: 'Save changes' })
      ).toBeEnabled();
      await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
        '  Updated category  '
      );
      await dialog.getByRole('button', { name: 'Save changes' }).click();
    }

    await expect(dialog).not.toBeVisible();
    expect(updates).toEqual([{ name: 'Updated category' }]);
    await expect(
      page.getByRole('heading', { name: 'Updated category' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(
      'Updated category'
    );
  });
}

test('confirms archiving a category and refreshes its status', async ({
  page,
}) => {
  await setup(page);
  let current = { ...category };
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
    if (requests.length === 1) {
      await route.fulfill({ status: 500, json: { name: 'UnexpectedError' } });

      return;
    }

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
  await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(
    page.getByText('An error occurred', { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Archive', exact: true })
  ).toBeEnabled();
  await expect(page.getByText('Active', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: 'Archive', exact: true })
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
  await expect
    .poll(() => requests)
    .toEqual([
      { method: 'POST', body: null },
      { method: 'POST', body: null },
    ]);
  finishArchive();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Category archived successfully')).toBeVisible();
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
  expect(requests).toHaveLength(2);
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
      if (checks === 2) {
        await response;
      }

      if (checks === 3) {
        await route.fulfill({ status: 500, json: { name: 'UnexpectedError' } });

        return;
      }

      await route.fulfill({ json: { canDelete: checks !== 2 } });
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
  await test.step('A failed recheck hides deletion until a fresh menu open succeeds', async () => {
    await page.keyboard.press('Escape');
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
    expect(checks).toBe(4);
  });
});

{
  const status = 'archived' as const;
  test(`deletes an eligible ${status} category and refreshes the categories list`, async ({
    page,
  }) => {
    await setup(page);
    let deleted = false;
    let detailReadsAfterDelete = 0;
    const requests: { method: string; body: string | null }[] = [];
    let finishDelete = () => {};

    const response = new Promise<void>((resolve) => {
      finishDelete = resolve;
    });

    const row: IRevenueExpenseAndSuspenseAccountBalanceDto = {
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

    const summary: IRevenueAndExpenseActivitySummaryDto = {
      currencyCode: 'NGN',
      period: { from: '2026-10-01', to: '2026-10-15' },
      comparisonPeriod: { from: '2026-09-16', to: '2026-09-30' },
      revenue: emptySection,
      expenses: emptySection,
      suspense: { amount: { ...money, amount: 0 }, transactionCount: 0 },
    };

    await page.route(
      '**/api/v1/reporting/ledger/revenue-and-expense-activity-summary?*',
      (route) => route.fulfill({ json: summary })
    );
    await page.route('**/api/v1/ledger?*', (route) =>
      route.fulfill({
        json: {
          data: deleted ? [] : [{ ...category, status }],
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
      '**/api/v1/reporting/ledger/revenue-expense-and-suspense-account-balances?*',
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
        if (deleted) {
          detailReadsAfterDelete += 1;
        }

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
    await confirm.click();
    await expect(
      dialog.getByRole('button', { name: 'Delete', exact: true })
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
