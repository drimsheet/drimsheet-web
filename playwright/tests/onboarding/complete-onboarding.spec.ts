import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const entity = { ...authenticatedAccountingEntity, name: 'Integration User' };

const preferencesPath = '/users/preferences';

const paths = [
  '/accounting/accounting-entity',
  '/accounting/accounting-entity/switch',
  '/accounting/fiscal-year',
  '/accounting/accounting-intervals',
  '/accounting/accounting-context',
  '/accounting/reporting-intervals',
  '/accounting/reporting-context',
  '/ledger/header-accounts/setup',
];

const headers = [
  ['revenue', 'services'],
  ['revenue', 'employment_income'],
  ['revenue', 'grants'],
  ['revenue', 'gifts'],
  ['expense', 'default_direct_cost'],
  ['expense', 'rent_and_utilities'],
  ['expense', 'bank_charge'],
  ['expense', 'interest'],
].map(([type, behavior]) => ({
  id: `header-${behavior}`,
  type,
  behavior,
  isControlAccount: true,
  name: `Localized ${behavior}`,
}));

interface IWrite {
  method: string;
  path: string;
  payload: Record<string, unknown>;
  entityId?: string;
}

async function prepare(
  page: Page,
  failure?: {
    path: string;
    status?: number;
    abort?: boolean;
    errorKey?: string;
  },
  pauseFirst?: Promise<void>
) {
  const writes: IWrite[] = [];
  let entityCreated = false;
  let failureSent = false;
  await registerAuthenticatedAppRoutes(page);
  await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z'));
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    if (path.startsWith('/auth/'))
      return route.fulfill({ json: { accessToken: 'integration-test-token' } });

    if (path === '/currencies')
      return route.fulfill({
        json: [
          { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
          { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
        ],
      });

    if (path === '/accounting/jurisdictions')
      return route.fulfill({
        json: [
          {
            code: 'NG',
            name: 'Nigeria',
            currencyCode: 'NGN',
            maxFiscalMonths: 23,
            accountingStandards: {
              individual: ['IFRS'],
              sole_trader: ['IFRS'],
              private_company: ['IFRS'],
            },
          },
        ],
      });

    if (request.method() === 'GET') {
      if (path === '/accounting/accounting-entities')
        return route.fulfill({ json: entityCreated ? [entity] : [] });

      return route.fallback();
    }

    const payload = request.postDataJSON();
    writes.push({
      method: request.method(),
      path,
      payload,
      entityId: request.headers()['x-accounting-entity-id'],
    });
    if (writes.length === 1 && pauseFirst) await pauseFirst;

    if (failure?.path === path && !failureSent) {
      failureSent = true;
      if (failure.abort) return route.abort('connectionfailed');

      return route.fulfill({
        status: failure.status ?? 422,
        json: { errorKey: failure.errorKey, validationErrors: [] },
      });
    }

    if (path === preferencesPath) {
      return route.fulfill({
        json: {
          userId: authenticatedUser.id,
          createdBy: authenticatedUser.id,
          lastActiveAccountingEntityId: null,
          appPreferences: payload,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-10-23T12:00:00.000Z',
        },
      });
    }

    if (path === paths[0]) entityCreated = true;

    if (path === paths[0] || path === paths[1])
      return route.fulfill({ json: entity });

    if (path === paths[7]) return route.fulfill({ json: headers });

    if (path === '/ledger/revenues' || path === '/ledger/expenses')
      return route.fulfill({
        json: { ...payload, id: `saved-${writes.length}` },
      });

    if (paths.includes(path))
      return route.fulfill({
        json: { ...payload, id: `saved-${path.split('/').at(-1)}` },
      });

    throw new Error(`Unexpected onboarding write: ${request.method()} ${path}`);
  });
  await page.goto('/auth/signup/complete?token=onboarding-test-token');
  await page.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await page.getByRole('combobox', { name: 'Country of residence' }).click();
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await page
    .getByRole('textbox', { name: 'Financial year name' })
    .fill('Trading 2026');
  await page
    .getByRole('combobox', {
      name: 'How would you like to group your records?',
    })
    .click();
  await page.getByRole('option', { name: 'By month', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Month 1', exact: true })
    .fill('Launch');
  await page
    .getByRole('button', { name: 'Continue to reports', exact: true })
    .click();
  await page
    .getByRole('textbox', { name: 'Reporting setup name' })
    .fill('Board pack');
  await page
    .getByRole('combobox', { name: 'Currency for your reports' })
    .fill('US Dollar');
  await page.getByRole('option', { name: /US Dollar/ }).click();
  await page
    .getByRole('textbox', { name: 'Quarter 1', exact: true })
    .fill('Board review');
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await page.getByRole('checkbox', { name: 'Gifts (Default)' }).uncheck();
  await page.getByRole('button', { name: 'Add income category' }).click();
  await page.getByRole('combobox', { name: /Parent account/ }).click();
  await page.getByRole('option', { name: 'Services', exact: true }).click();
  await page.getByRole('textbox', { name: /Category name/ }).fill('Consulting');
  await page.getByRole('button', { name: 'Add to setup' }).click();
  await page
    .getByRole('button', { name: 'Continue to expense categories' })
    .click();
  await page.getByRole('checkbox', { name: 'Interest (Default)' }).uncheck();
  await page.getByRole('button', { name: 'Add expense category' }).click();
  await page.getByRole('combobox', { name: /Parent account/ }).click();
  await page.getByRole('option', { name: 'Direct costs', exact: true }).click();
  await page.getByRole('textbox', { name: /Category name/ }).fill('Materials');
  await page.getByRole('button', { name: 'Add to setup' }).click();
  expect(writes).toEqual([]);

  return writes;
}

test('Finish saves all drafts in order, links returned IDs, and prevents duplicate submission', async ({
  page,
}) => {
  let release = () => {};

  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });

  const writes = await prepare(page, undefined, pending);
  await page.getByRole('button', { name: 'Finish setup' }).click();
  await expect(
    page.getByRole('button', { name: 'Finish setup' })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Back', exact: true })
  ).toBeDisabled();
  await expect(
    page.getByRole('checkbox', { name: 'Materials' })
  ).toBeDisabled();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].path).toBe(preferencesPath);
  release();
  await expect(page).toHaveURL('/dashboard');
  expect(writes.map(({ path }) => path)).toEqual([
    preferencesPath,
    ...paths,
    ...Array(4).fill('/ledger/revenues'),
    ...Array(4).fill('/ledger/expenses'),
  ]);
  expect(writes[0]).toMatchObject({
    method: 'PATCH',
    path: preferencesPath,
    payload: { appUsageMode: 'non_power_user', theme: 'system' },
  });
  const creations = writes.slice(1);
  expect(creations[0].payload).toEqual({
    name: 'Integration User',
    entityType: 'individual',
    jurisdictionCode: 'NG',
    functionalCurrencyCode: 'NGN',
  });
  expect(creations[1].payload).toEqual({ accountingEntityId: entity.id });
  expect(
    creations.slice(2).every(({ entityId }) => entityId === entity.id)
  ).toBe(true);
  expect(creations[2].payload).toEqual({
    accountingEntityId: entity.id,
    name: 'Trading 2026',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
    status: 'open',
  });
  expect(creations[3].payload).toEqual({
    fiscalYearId: 'saved-fiscal-year',
    unit: 'month',
    count: 12,
    periods: Array.from({ length: 12 }, (_, i) => ({
      name: i === 0 ? 'Launch' : `M${i + 1}`,
    })),
  });
  expect(creations[4].payload).toEqual({
    fiscalYearId: 'saved-fiscal-year',
    accountingIntervalId: 'saved-accounting-intervals',
    accountingStandardCode: 'IFRS',
    name: 'Trading 2026',
    description: null,
  });
  expect(creations[5].payload).toEqual({
    fiscalYearId: 'saved-fiscal-year',
    unit: 'quarter',
    count: 4,
    periods: [
      { name: 'Board review' },
      { name: 'Q2' },
      { name: 'Q3' },
      { name: 'Q4' },
    ],
  });
  expect(creations[6].payload).toEqual({
    accountingContextId: 'saved-accounting-context',
    reportingIntervalId: 'saved-reporting-intervals',
    reportingCurrencyCode: 'USD',
    name: 'Board pack',
    description: null,
  });
  expect(Object.keys(creations[7].payload)).toHaveLength(24);
  expect(creations.slice(8).map(({ payload }) => payload)).toEqual(
    [
      ['Services (Default)', 'services'],
      ['Employment income (Default)', 'employment_income'],
      ['Grants (Default)', 'grants'],
      ['Consulting', 'services'],
      ['Direct costs (Default)', 'default_direct_cost'],
      ['Rent and utilities (Default)', 'rent_and_utilities'],
      ['Bank charges (Default)', 'bank_charge'],
      ['Materials', 'default_direct_cost'],
    ].map(([name, behavior]) => ({
      name,
      behavior,
      controlAccountId: `header-${behavior}`,
      isControlAccount: false,
      status: 'active',
    }))
  );
});

for (const path of [
  '/accounting/fiscal-year',
  '/accounting/reporting-context',
  '/ledger/expenses',
]) {
  test(`stops after a rejected ${path} without offering workflow resumption`, async ({
    page,
  }) => {
    const writes = await prepare(page, { path });
    await page.getByRole('button', { name: 'Finish setup' }).click();
    await expect(
      page.getByText('An error occurred', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
    await expect(page).toHaveURL('/onboarding');
    await expect(
      page.getByRole('checkbox', { name: 'Materials' })
    ).toBeChecked();
    await expect(
      page.getByRole('button', { name: 'Finish setup' })
    ).toBeDisabled();
    expect(writes.at(-1)?.path).toBe(path);
    expect(writes.filter((write) => write.path === path)).toHaveLength(1);
    expect(writes.filter(({ path }) => path === paths[0])).toHaveLength(1);
  });
}

test('does not retry a write with an unknown server outcome', async ({
  page,
}) => {
  const writes = await prepare(page, {
    path: '/accounting/fiscal-year',
    abort: true,
  });

  await page.getByRole('button', { name: 'Finish setup' }).click();
  await expect(
    page.getByText('An error occurred', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Finish setup' })
  ).toBeDisabled();
  await expect(page).toHaveURL('/onboarding');
  expect(writes.map(({ path }) => path)).toEqual([
    preferencesPath,
    ...paths.slice(0, 3),
  ]);
});

test('skips category creation when no categories are selected', async ({
  page,
}) => {
  const writes = await prepare(page);
  for (const checkbox of await page.getByRole('checkbox').all())
    await checkbox.uncheck();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  for (const checkbox of await page.getByRole('checkbox').all())
    await checkbox.uncheck();
  await page
    .getByRole('button', { name: 'Continue to expense categories' })
    .click();
  await page.getByRole('button', { name: 'Finish setup' }).click();
  await expect(page).toHaveURL('/dashboard');
  expect(writes.map(({ path }) => path)).toEqual([preferencesPath, ...paths]);
});

test('shows the API error toast for activation failure without exposing workflow stages', async ({
  page,
}) => {
  const writes = await prepare(page, {
    path: '/accounting/accounting-entity/switch',
    status: 403,
    errorKey: 'accounting_error_accounting_entity_access_forbidden',
  });

  await page.getByRole('button', { name: 'Finish setup' }).click();
  await expect(
    page.getByText('Accounting entity access denied.', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  await expect(
    page.getByText(/Could not finish legal entity activation/)
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Finish setup' })
  ).toBeDisabled();
  await expect(page).toHaveURL('/onboarding');
  expect(writes.filter(({ path }) => path === paths[0])).toHaveLength(1);
  expect(writes.filter(({ path }) => path === paths[1])).toHaveLength(1);
});

test('does not create a legal entity when updating preferences fails', async ({
  page,
}) => {
  const writes = await prepare(page, {
    path: preferencesPath,
    status: 422,
    errorKey: 'app_error_user_preferences_app_theme_invalid',
  });

  await page.getByRole('button', { name: 'Finish setup' }).click();
  await expect(
    page.getByText('Invalid theme option.', { exact: true })
  ).toBeVisible();
  expect(writes.map(({ path }) => path)).toEqual([preferencesPath]);
  await expect(
    page.getByRole('button', { name: 'Finish setup' })
  ).toBeDisabled();
  await expect(page).toHaveURL('/onboarding');
  expect(writes.filter(({ path }) => path === paths[0])).toHaveLength(0);
});
