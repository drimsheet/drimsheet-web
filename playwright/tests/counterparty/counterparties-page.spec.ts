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
    version: 1,
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
    version: 1,
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
    version: 1,
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
    version: 1,
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

test.describe('Counterparties Page Flow', () => {
  test('lists counterparties and renders table structure correctly', async ({
    page,
  }) => {
    await registerCounterpartiesPageRoutes(page);

    // Mock initial GET request
    let wasListRequested = false;
    await page.route(counterpartiesEndpoint, async (route) => {
      if (route.request().method() === 'GET') {
        wasListRequested = true;
        await route.fulfill({
          status: 200,
          json: {
            data: mockCounterparties,
            meta: {
              page: 1,
              limit: 10,
              total: mockCounterparties.length,
              totalPages: 1,
            },
          },
        });
      }
    });

    page.on('request', (req) => console.log('REQ:', req.method(), req.url()));
    page.on('console', (msg) => console.log('CONSOLE:', msg.text()));

    await signIn(page);
    await page.goto('/counterparties');
    await expect(page).toHaveURL('/counterparties');

    // Verify breadcrumbs and headers
    await expect(
      page.getByText('Counterparties', { exact: true }).first()
    ).toBeVisible();

    // Verify counterparties rendered in table (this waits for the request to complete)
    await expect(
      page.getByRole('cell', { name: 'Alice Vendor' })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Bob Contractor' })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Charlie Employer' })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Dave Archived' })
    ).toBeVisible();

    // Verify API was called
    expect(wasListRequested).toBe(true);

    // Verify status badges
    const activeBadges = page
      .getByRole('cell')
      .getByText('Active', { exact: true });
    const archivedBadges = page
      .getByRole('cell')
      .getByText('Archived', { exact: true });
    await expect(activeBadges).toHaveCount(3);
    await expect(archivedBadges).toHaveCount(1);

    // Verify type labels
    await expect(
      page.getByRole('cell').getByText('Organization', { exact: true })
    ).toHaveCount(2);
    await expect(
      page.getByRole('cell').getByText('Individual', { exact: true })
    ).toHaveCount(2);

    // Verify roles badges
    await expect(
      page.getByRole('cell').getByText('Vendor', { exact: true })
    ).toHaveCount(2);
    await expect(
      page.getByRole('cell').getByText('Contractor', { exact: true })
    ).toHaveCount(1);
    await expect(
      page.getByRole('cell').getByText('Employer', { exact: true })
    ).toHaveCount(1);
  });

  test('supports searching counterparties with debounce', async ({ page }) => {
    await registerCounterpartiesPageRoutes(page);

    await page.route(counterpartiesEndpoint, async (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const searchVal = url.searchParams.get('search');

        if (searchVal === 'Bob') {
          await route.fulfill({
            json: {
              data: [mockCounterparties[1]],
              meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
            },
          });
        } else {
          await route.fulfill({
            json: {
              data: mockCounterparties,
              meta: {
                page: 1,
                limit: 10,
                total: mockCounterparties.length,
                totalPages: 1,
              },
            },
          });
        }
      }
    });

    await signIn(page);
    await page.goto('/counterparties');

    // Verify initial data rendered
    await expect(
      page.getByRole('cell', { name: 'Alice Vendor' })
    ).toBeVisible();

    // Perform search
    const searchInput = page.getByPlaceholder(/Search counterparties/i);
    await expect(searchInput).toBeVisible();

    const requestPromise = page.waitForRequest((req) => {
      const url = new URL(req.url());
      return (
        req.method() === 'GET' &&
        url.pathname.includes('/api/v1/counterparties') &&
        url.searchParams.get('search') === 'Bob'
      );
    });

    await searchInput.fill('Bob');

    // Wait for the debounced search request
    const request = await requestPromise;
    const url = new URL(request.url());
    expect(url.searchParams.get('search')).toBe('Bob');

    // Verify UI is updated
    await expect(
      page.getByRole('cell', { name: 'Bob Contractor' })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Alice Vendor' })
    ).not.toBeVisible();
  });

  test('supports filtering counterparties by status, type, and roles', async ({
    page,
  }) => {
    await registerCounterpartiesPageRoutes(page);

    let lastFilters: Record<string, string | string[] | null> = {};
    await page.route(counterpartiesEndpoint, async (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());

        const rolesParams = Array.from(url.searchParams.entries())
          .filter(([k]) => k.startsWith('roles'))
          .map(([, v]) => v);

        lastFilters = {
          status: url.searchParams.get('status'),
          type: url.searchParams.get('type'),
          roles: rolesParams,
        };

        await route.fulfill({
          json: {
            data: mockCounterparties,
            meta: {
              page: 1,
              limit: 10,
              total: mockCounterparties.length,
              totalPages: 1,
            },
          },
        });
      }
    });

    await signIn(page);
    await page.goto('/counterparties');

    // 1. Filter by Status -> Active
    const statusHeader = page.getByTestId('column-header-status');
    await statusHeader.getByTestId('table-filter-trigger').click();
    await page.getByRole('button', { name: 'Active', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect.poll(() => lastFilters.status).toBe('active');

    // 2. Filter by Type -> Individual
    const typeHeader = page.getByTestId('column-header-type');
    await typeHeader.getByTestId('table-filter-trigger').click();
    await page.getByRole('button', { name: 'Individual', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect.poll(() => lastFilters.type).toBe('individual');

    // 3. Filter by Role -> Vendor
    const rolesHeader = page.getByTestId('column-header-roles');
    await rolesHeader.getByTestId('table-filter-trigger').click();
    await page.getByRole('button', { name: 'Vendor', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect.poll(() => lastFilters.roles).toContain('vendor');
  });

  test('supports sorting counterparties by Name', async ({ page }) => {
    await registerCounterpartiesPageRoutes(page);

    await page.route(counterpartiesEndpoint, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: {
            data: mockCounterparties,
            meta: {
              page: 1,
              limit: 10,
              total: mockCounterparties.length,
              totalPages: 1,
            },
          },
        });
      }
    });

    await signIn(page);
    await page.goto('/counterparties');

    // Sort by Name (click, wait for request, check query params)
    const nameHeader = page.getByTestId('column-header-name');

    const requestPromise = page.waitForRequest((req) => {
      const url = new URL(req.url());
      return (
        req.method() === 'GET' &&
        url.pathname.includes('/api/v1/counterparties') &&
        url.searchParams.get('orderBy') === 'name'
      );
    });

    await nameHeader.click();
    const request = await requestPromise;
    const url = new URL(request.url());
    expect(url.searchParams.get('orderBy')).toBe('name');
    expect(url.searchParams.get('sortDirection')).toBeTruthy();
  });

  test('supports pagination of counterparties', async ({ page }) => {
    await registerCounterpartiesPageRoutes(page);

    await page.route(counterpartiesEndpoint, async (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const pageParam = url.searchParams.get('page') || '1';

        await route.fulfill({
          json: {
            data: mockCounterparties.slice(0, 2),
            meta: {
              page: Number(pageParam),
              limit: 2,
              total: 4,
              totalPages: 2,
            },
          },
        });
      }
    });

    await signIn(page);
    await page.goto('/counterparties');

    // Verify second page link is visible and click it
    const page2Link = page.getByRole('link', { name: '2', exact: true });
    await expect(page2Link).toBeVisible();

    const requestPromise = page.waitForRequest((req) => {
      const url = new URL(req.url());
      return (
        req.method() === 'GET' &&
        url.pathname.includes('/api/v1/counterparties') &&
        url.searchParams.get('page') === '2'
      );
    });

    await page2Link.click();
    const request = await requestPromise;
    const url = new URL(request.url());
    expect(url.searchParams.get('page')).toBe('2');
  });

  test('opens creation select dialog on add counterparty click', async ({
    page,
  }) => {
    await registerCounterpartiesPageRoutes(page);

    await page.route(counterpartiesEndpoint, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: {
            data: [],
            meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
          },
        });
      }
    });

    await signIn(page);
    await page.goto('/counterparties');

    const addButton = page.getByRole('button', { name: /Add Counterparty/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    const selectionDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select counterparty role/i }),
    });
    await expect(selectionDialog).toBeVisible();
  });
});
