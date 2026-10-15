import type {
  IAccountCounterpartyParticipationDto,
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
