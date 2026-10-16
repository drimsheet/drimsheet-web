import type {
  IAccountingContextDto,
  IReportingContextDto,
} from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';

const accountingEndpoint = '**/api/v1/accounting/accounting-contexts';
const reportingEndpoint = '**/api/v1/accounting/reporting-contexts';
const timestamp = '2026-01-01T00:00:00Z';

const accountingContext: IAccountingContextDto = {
  id: 'accounting-2026',
  createdBy: authenticatedUser.id,
  name: 'Statutory books',
  description: null,
  accountingEntityId: authenticatedAccountingEntity.id,
  accountingStandardCode: 'IFRS',
  fiscalYearId: 'fy-2026',
  currentAccountingPeriodId: 'feb-2026',
  createdAt: timestamp,
  updatedAt: timestamp,
  closedAt: null,
  fiscalYear: {
    id: 'fy-2026',
    createdBy: authenticatedUser.id,
    name: 'FY 2026',
    accountingEntityId: authenticatedAccountingEntity.id,
    startDate: timestamp,
    endDate: '2026-12-31T00:00:00Z',
    status: 'closing',
    closedAt: null,
    updatedAt: timestamp,
  },
  accountingPeriods: ['January', 'February'].map((name, index) => ({
    id: index === 0 ? 'jan-2026' : 'feb-2026',
    createdBy: authenticatedUser.id,
    name: `${name} 2026`,
    accountingEntityId: authenticatedAccountingEntity.id,
    fiscalYearId: 'fy-2026',
    unit: 'month',
    count: 1,
    startDate: index === 0 ? timestamp : '2026-02-01T00:00:00Z',
    endDate: index === 0 ? '2026-01-31T00:00:00Z' : '2026-02-28T00:00:00Z',
    status: 'open',
    closedAt: null,
    updatedAt: timestamp,
  })),
};

const reportingContext: IReportingContextDto = {
  id: 'reporting-2026',
  createdBy: authenticatedUser.id,
  name: 'Management reporting',
  description: null,
  accountingEntityId: authenticatedAccountingEntity.id,
  accountingStandardCode: 'IFRS',
  accountingContextId: accountingContext.id,
  reportingCurrencyCode: 'USD',
  currentReportingPeriodId: 'q2-2026',
  createdAt: timestamp,
  updatedAt: timestamp,
  closedAt: null,
  fiscalYear: accountingContext.fiscalYear,
  reportingPeriods: [1, 2].map((quarter) => ({
    id: `q${quarter}-2026`,
    createdBy: authenticatedUser.id,
    name: `Q${quarter} 2026`,
    accountingEntityId: authenticatedAccountingEntity.id,
    fiscalYearId: 'fy-2026',
    unit: 'quarter',
    count: 1,
    startDate: quarter === 1 ? timestamp : '2026-04-01T00:00:00Z',
    endDate: quarter === 1 ? '2026-03-31T00:00:00Z' : '2026-06-30T00:00:00Z',
    updatedAt: timestamp,
  })),
};

test.beforeEach(async ({ page }) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route(accountingEndpoint, (route) =>
    route.fulfill({ json: [accountingContext] })
  );
  await page.route(reportingEndpoint, (route) =>
    route.fulfill({ json: [reportingContext] })
  );
  await page.route('**/api/v1/users/preferences', (route) =>
    route.fulfill({
      json: {
        userId: authenticatedUser.id,
        createdBy: authenticatedUser.id,
        lastActiveAccountingEntityId: authenticatedAccountingEntity.id,
        appPreferences: { theme: 'light', appUsageMode: 'non_power_user' },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })
  );
  await page.route('**/api/v1/auth/refresh-access-token', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.route('**/api/v1/auth/login-with-email', (route) =>
    route.fulfill({ json: { accessToken: 'integration-test-token' } })
  );
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
  });
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
});

test('opens Legal Entity from navigation and shows the saved working periods', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByRole('link', { name: 'Legal Entity', exact: true }).click();
  await expect(page).toHaveURL('/legal-entity');
  await expect(
    page.getByRole('link', { name: 'Legal Entity', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('heading', { name: 'Legal Entity', exact: true })
  ).toBeVisible();
  const details = page.getByRole('region', { name: 'Details', exact: true });
  await expect(details).toContainText('Integration Entity');
  await expect(details).toContainText('Individual');
  await expect(details).toContainText('Official Currency');
  await expect(details).toContainText('NGN');
  await expect(details).toContainText('Country of Residence');
  await expect(details).toContainText('Nigeria');
  await expect(details).toContainText('Active');

  const accounting = page.getByRole('region', {
    name: 'Accounting Context',
    exact: true,
  });

  await expect(accounting).toContainText('February 2026');
  await expect(accounting).not.toContainText('January 2026');
  await expect(accounting).toContainText('Month');
  await expect(accounting).toContainText('Closing');
  await expect(accounting).toContainText('Feb 1, 2026');
  await expect(accounting).toContainText('Feb 28, 2026');

  const reporting = page.getByRole('region', {
    name: 'Reporting Context',
    exact: true,
  });

  await expect(reporting).toContainText('Q2 2026');
  await expect(reporting).not.toContainText('Q1 2026');
  await expect(reporting).toContainText('USD');
  await expect(reporting).toContainText('Quarter');
  await expect(reporting).toContainText('Apr 1, 2026');
  await expect(reporting).toContainText('Jun 30, 2026');
  await page.screenshot({
    path: testInfo.outputPath('legal-entity-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({
    path: testInfo.outputPath('legal-entity-dark.png'),
    fullPage: true,
    animations: 'disabled',
  });
});

test('keeps accounting visible when reporting fails and retries only that section', async ({
  page,
}) => {
  let failReporting = true;
  let accountingRequests = 0;
  await page.route(accountingEndpoint, (route) => {
    accountingRequests += 1;

    return route.fulfill({ json: [accountingContext] });
  });
  await page.route(reportingEndpoint, (route) =>
    route.fulfill(
      failReporting ? { status: 500, json: {} } : { json: [reportingContext] }
    )
  );
  await page.getByRole('link', { name: 'Legal Entity', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Accounting Context', exact: true })
  ).toContainText('February 2026');

  const reporting = page.getByRole('region', {
    name: 'Reporting Context',
    exact: true,
  });

  await expect(reporting.getByRole('alert')).toContainText(
    'We couldn’t load Reporting Context'
  );
  failReporting = false;
  await reporting.getByRole('button', { name: 'Try again' }).click();
  await expect(reporting).toContainText('Q2 2026');
  await expect(reporting.getByRole('alert')).toHaveCount(0);
  expect(accountingRequests).toBe(1);
});

test('shows independent loading and empty context states', async ({ page }) => {
  let releaseAccounting!: () => void;

  const accountingReady = new Promise<void>((resolve) => {
    releaseAccounting = resolve;
  });

  await page.route(accountingEndpoint, async (route) => {
    await accountingReady;
    await route.fulfill({ json: [] });
  });
  await page.route(reportingEndpoint, (route) => route.fulfill({ json: [] }));
  await page.getByRole('link', { name: 'Legal Entity', exact: true }).click();

  const accounting = page.getByRole('region', {
    name: 'Accounting Context',
    exact: true,
  });

  const reporting = page.getByRole('region', {
    name: 'Reporting Context',
    exact: true,
  });

  await expect(accounting.getByRole('status')).toHaveAccessibleName(
    'Loading Accounting Context…'
  );
  await expect(reporting).toContainText('No open contexts');
  releaseAccounting();
  await expect(accounting).toContainText('No open contexts');
  await expect(accounting.getByRole('status')).toHaveCount(0);
});

test('does not substitute the first period when the saved selections are missing', async ({
  page,
}) => {
  await page.route(accountingEndpoint, (route) =>
    route.fulfill({
      json: [{ ...accountingContext, currentAccountingPeriodId: 'missing' }],
    })
  );
  await page.route(reportingEndpoint, (route) =>
    route.fulfill({
      json: [{ ...reportingContext, currentReportingPeriodId: 'missing' }],
    })
  );
  await page.getByRole('link', { name: 'Legal Entity', exact: true }).click();
  for (const name of ['Accounting Context', 'Reporting Context']) {
    const section = page.getByRole('region', { name, exact: true });
    await expect(section.getByRole('alert')).toContainText(
      'The selected period is not available'
    );
    await expect(section).toContainText('Not available');
  }

  await expect(page.getByText('January 2026', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Q1 2026', { exact: true })).toHaveCount(0);
});

test('renders every returned context and wraps long entity names on mobile', async ({
  page,
}, testInfo) => {
  const longName =
    'Northstar International Accounting and Advisory Services Limited';

  await page.route('**/api/v1/accounting/accounting-entity', (route) =>
    route.fulfill({
      json: { ...authenticatedAccountingEntity, name: longName },
    })
  );
  await page.route(accountingEndpoint, (route) =>
    route.fulfill({
      json: [
        accountingContext,
        {
          ...accountingContext,
          id: 'accounting-2027',
          name: 'Next fiscal year',
        },
      ],
    })
  );
  await page.route(reportingEndpoint, (route) =>
    route.fulfill({
      json: [
        reportingContext,
        {
          ...reportingContext,
          id: 'reporting-local',
          name: 'Local reporting',
          reportingCurrencyCode: 'NGN',
        },
      ],
    })
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/legal-entity');
  await expect(
    page.getByRole('region', { name: 'Details', exact: true })
  ).toContainText(longName);
  await expect(
    page.getByRole('heading', { name: 'Next fiscal year' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Local reporting' })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('legal-entity-mobile.png'),
    fullPage: true,
    animations: 'disabled',
  });
});
