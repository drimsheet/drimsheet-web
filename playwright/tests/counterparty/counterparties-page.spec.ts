import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const jurisdictionsEndpoint = '**/api/v1/accounting/jurisdictions';
const counterpartiesEndpoint = '**/api/v1/counterparties*';

const mockCounterparties: ICounterpartyDto[] = [
  {
    id: 'cp-1',
    accountingEntityId: '00000000-0000-4000-8000-000000000002',
    createdBy: authenticatedUser.id,
    name: 'Alice Vendor',
    status: 'active',
    type: 'organization',
    roles: ['vendor'],
    meta: {},
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cp-2',
    accountingEntityId: '00000000-0000-4000-8000-000000000002',
    createdBy: authenticatedUser.id,
    name: 'Bob Contractor',
    status: 'active',
    type: 'individual',
    roles: ['contractor'],
    meta: {},
    createdAt: '2026-01-02T09:00:00.000Z',
    updatedAt: '2026-01-02T09:00:00.000Z',
  },
  {
    id: 'cp-3',
    accountingEntityId: '00000000-0000-4000-8000-000000000002',
    createdBy: authenticatedUser.id,
    name: 'Charlie Employer',
    status: 'active',
    type: 'individual',
    roles: ['employer'],
    meta: {},
    createdAt: '2026-01-03T10:00:00.000Z',
    updatedAt: '2026-01-03T10:00:00.000Z',
  },
  {
    id: 'cp-4',
    accountingEntityId: '00000000-0000-4000-8000-000000000002',
    createdBy: authenticatedUser.id,
    name: 'Dave Archived',
    status: 'archived',
    type: 'organization',
    roles: ['vendor'],
    meta: {},
    createdAt: '2026-01-04T11:00:00.000Z',
    updatedAt: '2026-01-04T11:00:00.000Z',
  },
];

async function registerCounterpartiesPageRoutes(page: Page) {
  await registerAuthenticatedAppRoutes(page);

  await page.route(refreshEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.route(jurisdictionsEndpoint, async (route) => {
    await route.fulfill({
      json: [
        {
          code: 'NG',
          name: 'Nigeria',
          currencyCode: 'NGN',
          maxFiscalMonths: 12,
          accountingStandards: {
            code: 'IFRS',
            name: 'International Financial Reporting Standards',
          },
        },
      ],
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

test('combines server search, filters, sorting and pagination without losing query state', async ({
  page,
}) => {
  await registerCounterpartiesPageRoutes(page);

  const rows: ICounterpartyDto[] = [
    ...mockCounterparties,
    ...Array.from({ length: 8 }, (_, index) => ({
      ...mockCounterparties[0],
      id: 'extra-' + index,
      name: 'Extra Vendor ' + index,
    })),
  ];

  let lastQuery: Record<string, unknown> = {};
  await page.route(counterpartiesEndpoint, async (route) => {
    const q = new URL(route.request().url()).searchParams;

    const roles = [...q.entries()]
      .filter(([key]) => key.startsWith('roles'))
      .map(([, value]) => value);

    const search = q.get('search') ?? '';
    const status = q.get('status');
    const type = q.get('type');
    const direction = q.get('sortDirection');
    const requestedPage = Number(q.get('page') ?? 1);
    const limit = Number(q.get('limit') ?? 10);
    lastQuery = {
      page: requestedPage,
      limit,
      search,
      status,
      type,
      roles,
      orderBy: q.get('orderBy'),
      sortDirection: direction,
    };

    const result = rows.filter(
      (row) =>
        (!search || row.name.toLowerCase().includes(search.toLowerCase())) &&
        (!status || row.status === status) &&
        (!type || row.type === type) &&
        (!roles.length ||
          roles.some((role) =>
            row.roles.includes(role as 'vendor' | 'contractor' | 'employer')
          ))
    );

    if (q.get('orderBy') === 'name')
      result.sort(
        (a, b) => a.name.localeCompare(b.name) * (direction === 'desc' ? -1 : 1)
      );

    await route.fulfill({
      json: {
        data: result.slice((requestedPage - 1) * limit, requestedPage * limit),
        meta: {
          page: requestedPage,
          limit,
          total: result.length,
          totalPages: Math.ceil(result.length / limit),
        },
      },
    });
  });
  await signIn(page);
  await page.goto('/counterparties?sort=name&order=asc');
  const names = page.getByRole('table').getByRole('link');

  const header = page.getByRole('columnheader').filter({
    has: page.getByRole('button', { name: 'Sort by Name', exact: true }),
  });

  await test.step('Pagination displays another page and sorting resets it', async () => {
    await expect(
      page.getByRole('cell', { name: 'Alice Vendor', exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Next page', exact: true }).click();
    await expect(
      page.getByRole('cell', { name: 'Extra Vendor 7', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Alice Vendor', exact: true })
    ).not.toBeVisible();
    await expect
      .poll(() => lastQuery)
      .toEqual({
        page: 2,
        limit: 10,
        search: '',
        status: null,
        type: null,
        roles: [],
        orderBy: 'name',
        sortDirection: 'asc',
      });
    await page
      .getByRole('button', { name: 'Sort by Name', exact: true })
      .click();
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(names.first()).toHaveText('Extra Vendor 7');
    await expect.poll(() => lastQuery.page).toBe(1);
    await page.getByRole('button', { name: 'Next page', exact: true }).click();
    await expect(
      page.getByRole('cell', { name: 'Alice Vendor', exact: true })
    ).toBeVisible();
  });
  await test.step('Filters preserve sorting, reset pagination, and cancel unapplied changes', async () => {
    const trigger = page.getByRole('button', {
      name: 'Filter by Status',
      exact: true,
    });

    const statusFilter = page.getByRole('dialog', {
      name: 'Filter by Status',
      exact: true,
    });

    await trigger.click();
    await statusFilter
      .getByRole('checkbox', { name: 'Active', exact: true })
      .check();
    expect(new URL(page.url()).searchParams.get('status')).toBeNull();
    await statusFilter
      .getByRole('button', { name: 'Apply', exact: true })
      .click();
    await expect(names.first()).toHaveText('Extra Vendor 7');
    await expect
      .poll(() => lastQuery)
      .toEqual({
        page: 1,
        limit: 10,
        search: '',
        status: 'active',
        type: null,
        roles: [],
        orderBy: 'name',
        sortDirection: 'desc',
      });

    const activeTrigger = page.getByRole('button', {
      name: 'Filter by Status, 1 active',
      exact: true,
    });

    await activeTrigger.click();
    await statusFilter
      .getByRole('checkbox', { name: 'Archived', exact: true })
      .check();
    await page.keyboard.press('Escape');
    await expect(statusFilter).not.toBeVisible();
    await activeTrigger.click();
    await expect(
      statusFilter.getByRole('checkbox', { name: 'Archived', exact: true })
    ).not.toBeChecked();
    await page.keyboard.press('Escape');
    await expect(statusFilter).not.toBeVisible();

    const typeFilter = page.getByRole('dialog', {
      name: 'Filter by Type',
      exact: true,
    });

    await page
      .getByTestId('column-header-type')
      .getByTestId('table-filter-trigger')
      .click();
    await typeFilter
      .getByRole('checkbox', { name: 'Individual', exact: true })
      .check();
    await typeFilter
      .getByRole('button', { name: 'Apply', exact: true })
      .click();
    await expect(names).toHaveText(['Charlie Employer', 'Bob Contractor']);

    const rolesFilter = page.getByRole('dialog', {
      name: 'Filter by Roles',
      exact: true,
    });

    await page
      .getByTestId('column-header-roles')
      .getByTestId('table-filter-trigger')
      .click();
    await rolesFilter
      .getByRole('checkbox', { name: 'Contractor', exact: true })
      .check();
    await rolesFilter
      .getByRole('button', { name: 'Apply', exact: true })
      .click();
    await expect(names).toHaveText(['Bob Contractor']);
  });
  await test.step('Search combines with existing filters and clearing restores results', async () => {
    const search = page.getByPlaceholder(/Search counterparties/i);
    await search.fill('Nobody');
    await expect(
      page.getByRole('cell', { name: 'Bob Contractor', exact: true })
    ).not.toBeVisible();
    await expect
      .poll(() => lastQuery)
      .toEqual({
        page: 1,
        limit: 10,
        search: 'Nobody',
        status: 'active',
        type: 'individual',
        roles: ['contractor'],
        orderBy: 'name',
        sortDirection: 'desc',
      });
    await search.fill('Bob');
    await expect(names).toHaveText(['Bob Contractor']);
    await expect.poll(() => lastQuery.search).toBe('Bob');
    await page
      .getByRole('button', { name: 'Filter by Status, 1 active', exact: true })
      .click();
    await page
      .getByRole('dialog', { name: 'Filter by Status', exact: true })
      .getByRole('button', { name: 'Clear', exact: true })
      .click();
    await expect
      .poll(() => lastQuery)
      .toEqual({
        page: 1,
        limit: 10,
        search: 'Bob',
        status: null,
        type: 'individual',
        roles: ['contractor'],
        orderBy: 'name',
        sortDirection: 'desc',
      });
    await expect(names).toHaveText(['Bob Contractor']);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  });
});
