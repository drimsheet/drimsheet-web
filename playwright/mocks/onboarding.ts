import accountingLocale from '@/accounting/i18n/locales/en/accounting.json' with { type: 'json' };
import type {
  IAccountingEntity,
  IAccountingEntityCreationDto,
  ILedgerAccountDto,
  IRecommendedBootstrapDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { EAdjunctAccountRule, EContraAccountRule } from '@/shared/lib/api/Api';

export const userId = '00000000-0000-4000-8000-000000000001' as TEntityId;
export const entity = {
  id: '00000000-0000-4000-8000-000000000002' as TEntityId,
  ownerId: userId,
  createdBy: userId,
  name: 'Drimsheet',
  type: 'private_company',
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} satisfies IAccountingEntity;
export const payload = {
  name: 'Drimsheet',
  entityType: 'private_company',
  jurisdictionCode: 'NG',
  accountingStandardCode: 'IFRS',
  functionalCurrencyCode: 'NGN',
  reportingCurrencyCode: 'USD',
  fiscalYear: { startDate: '2026-01-01', endDate: '2026-12-31' },
  accountingPeriod: { unit: 'month', count: 12 },
  reportingPeriod: { unit: 'month', count: 12 },
  appPreferences: { appUsageMode: 'non_power_user' },
} satisfies IAccountingEntityCreationDto;
export const catalog = {
  receivables: [
    {
      key: 'statutory-receivables-default',
      name: accountingLocale.bootstrap_statutory_receivables_default_name,
      type: 'asset',
      subType: 'receivables',
      behavior: 'statutory_receivable',
      isControlAccount: false,
    },
  ],
  payables: [
    {
      key: 'statutory-payables-default',
      name: accountingLocale.bootstrap_statutory_payables_default_name,
      type: 'liability',
      subType: 'payable',
      behavior: 'tax_payable',
      isControlAccount: false,
      meta: null,
    },
  ],
  revenue: [
    {
      key: 'services-default',
      name: accountingLocale.bootstrap_services_default_name,
      type: 'revenue',
      subType: 'services',
      behavior: 'services',
      isControlAccount: false,
    },
    {
      key: 'employment-income-default',
      name: accountingLocale.bootstrap_employment_income_default_name,
      type: 'revenue',
      subType: 'employment_income',
      behavior: 'employment_income',
      isControlAccount: false,
    },
    {
      key: 'gain-on-sale-of-assets-default',
      name: accountingLocale.bootstrap_gain_on_sale_of_assets_default_name,
      type: 'revenue',
      subType: 'gain_on_asset_sale',
      behavior: 'gain_on_asset_sale',
      isControlAccount: false,
    },
    {
      key: 'unrealized-gains-default',
      name: accountingLocale.bootstrap_unrealized_gains_default_name,
      type: 'revenue',
      subType: 'unrealized_gains',
      behavior: 'unrealized_gains',
      isControlAccount: false,
    },
    {
      key: 'grants-default',
      name: accountingLocale.bootstrap_grants_default_name,
      type: 'revenue',
      subType: 'grants',
      behavior: 'grants',
      isControlAccount: false,
    },
    {
      key: 'gifts-default',
      name: accountingLocale.bootstrap_gifts_default_name,
      type: 'revenue',
      subType: 'gifts',
      behavior: 'gifts',
      isControlAccount: false,
    },
  ],
  expense: [
    {
      key: 'direct-costs-default',
      name: accountingLocale.bootstrap_direct_costs_default_name,
      type: 'expense',
      subType: 'direct_costs',
      behavior: 'default_direct_cost',
      isControlAccount: false,
    },
    {
      key: 'rent-and-utilities-default',
      name: accountingLocale.bootstrap_rent_and_utilities_default_name,
      type: 'expense',
      subType: 'rent_and_utilities',
      behavior: 'rent_and_utilities',
      isControlAccount: false,
    },
    {
      key: 'bank-charge-default',
      name: accountingLocale.bootstrap_bank_charge_default_name,
      type: 'expense',
      subType: 'bank_charge',
      behavior: 'bank_charge',
      isControlAccount: false,
    },
    {
      key: 'finance-cost-default',
      name: accountingLocale.bootstrap_finance_cost_default_name,
      type: 'expense',
      subType: 'finance_cost',
      behavior: 'finance_cost',
      isControlAccount: false,
    },
    {
      key: 'interest-default',
      name: accountingLocale.bootstrap_interest_default_name,
      type: 'expense',
      subType: 'interest',
      behavior: 'interest',
      isControlAccount: false,
    },
    {
      key: 'tax-expense-default',
      name: accountingLocale.bootstrap_tax_expense_default_name,
      type: 'expense',
      subType: 'income_tax_expense',
      behavior: 'tax_expense',
      isControlAccount: false,
    },
    {
      key: 'unrealized-loss-default',
      name: accountingLocale.bootstrap_unrealized_loss_default_name,
      type: 'expense',
      subType: 'unrealized_loss',
      behavior: 'unrealized_loss',
      isControlAccount: false,
    },
    {
      key: 'asset-disposal-loss-default',
      name: accountingLocale.bootstrap_asset_disposal_loss_default_name,
      type: 'expense',
      subType: 'loss_on_asset_disposal',
      behavior: 'asset_disposal_loss',
      isControlAccount: false,
    },
  ],
  suspense: [
    {
      key: 'asset-suspense-account',
      name: accountingLocale.bootstrap_asset_suspense_account_name,
      type: 'asset',
      subType: 'suspense',
      behavior: 'default',
      isControlAccount: false,
    },
    {
      key: 'liability-suspense-account',
      name: accountingLocale.bootstrap_liability_suspense_account_name,
      type: 'liability',
      subType: 'suspense',
      behavior: 'default',
      isControlAccount: false,
    },
  ],
} satisfies IRecommendedBootstrapDto;
export function accountId(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}` as TEntityId;
}
export const records = Object.values(catalog).flat();
function baseAccount(index: number, name: string): ILedgerAccountDto {
  return {
    id: accountId(index),
    code: String(index),
    materializedPath: String(index),
    accountingEntityId: entity.id,
    type: 'asset',
    normalBalance: 'debit',
    subType: 'receivables',
    behavior: 'default',
    isControlAccount: false,
    name,
    status: 'active',
    contraAccountRule: EContraAccountRule.ContraNotPermitted,
    adjunctAccountRule: EAdjunctAccountRule.AdjunctNotPermitted,
    openingBalanceDate: null,
    createdBy: userId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
    functionalBalance: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
  };
}
export const headers: ILedgerAccountDto[] = [
  {
    ...baseAccount(100, accountingLocale.header_cash_and_cash_equivalent_name),
    code: '100000',
    type: 'asset',
    subType: 'default',
    isControlAccount: true,
  },
  {
    ...baseAccount(101, accountingLocale.header_receivables_name),
    code: '102000',
    type: 'asset',
    subType: 'receivables',
    isControlAccount: true,
  },
  {
    ...baseAccount(102, accountingLocale.header_short_term_debt_name),
    code: '200000',
    type: 'liability',
    subType: 'default',
    isControlAccount: true,
  },
  {
    ...baseAccount(103, accountingLocale.header_payable_name),
    code: '201000',
    type: 'liability',
    subType: 'payable',
    isControlAccount: true,
  },
  {
    ...baseAccount(104, accountingLocale.header_retained_earnings_name),
    code: '301000',
    type: 'equity',
    subType: 'default',
    isControlAccount: false,
  },
  {
    ...baseAccount(105, accountingLocale.header_opening_balance_name),
    code: '399000',
    type: 'equity',
    subType: 'default',
    isControlAccount: false,
  },
  {
    ...baseAccount(106, accountingLocale.header_services_name),
    code: '401000',
    type: 'revenue',
    subType: 'services',
    isControlAccount: true,
  },
  {
    ...baseAccount(107, accountingLocale.header_employment_income_name),
    code: '403000',
    type: 'revenue',
    subType: 'employment_income',
    isControlAccount: true,
  },
  {
    ...baseAccount(108, accountingLocale.header_gain_on_asset_sale_name),
    code: '405000',
    type: 'revenue',
    subType: 'gain_on_asset_sale',
    isControlAccount: true,
  },
  {
    ...baseAccount(109, accountingLocale.header_unrealized_gains_name),
    code: '406000',
    type: 'revenue',
    subType: 'unrealized_gains',
    isControlAccount: true,
  },
  {
    ...baseAccount(110, accountingLocale.header_grants_name),
    code: '407000',
    type: 'revenue',
    subType: 'grants',
    isControlAccount: true,
  },
  {
    ...baseAccount(111, accountingLocale.header_gifts_name),
    code: '408000',
    type: 'revenue',
    subType: 'gifts',
    isControlAccount: true,
  },
  {
    ...baseAccount(112, accountingLocale.header_direct_costs_name),
    code: '500000',
    type: 'expense',
    subType: 'direct_costs',
    isControlAccount: true,
  },
  {
    ...baseAccount(113, accountingLocale.header_rent_and_utilities_name),
    code: '502000',
    type: 'expense',
    subType: 'rent_and_utilities',
    isControlAccount: true,
  },
  {
    ...baseAccount(114, accountingLocale.header_bank_charge_name),
    code: '507000',
    type: 'expense',
    subType: 'bank_charge',
    isControlAccount: true,
  },
  {
    ...baseAccount(115, accountingLocale.header_finance_cost_name),
    code: '508000',
    type: 'expense',
    subType: 'finance_cost',
    isControlAccount: true,
  },
  {
    ...baseAccount(116, accountingLocale.header_interest_name),
    code: '509000',
    type: 'expense',
    subType: 'interest',
    isControlAccount: true,
  },
  {
    ...baseAccount(117, accountingLocale.header_income_tax_expense_name),
    code: '510000',
    type: 'expense',
    subType: 'income_tax_expense',
    isControlAccount: true,
  },
  {
    ...baseAccount(118, accountingLocale.header_unrealized_loss_name),
    code: '511000',
    type: 'expense',
    subType: 'unrealized_loss',
    isControlAccount: true,
  },
  {
    ...baseAccount(119, accountingLocale.header_loss_on_asset_disposal_name),
    code: '512000',
    type: 'expense',
    subType: 'loss_on_asset_disposal',
    isControlAccount: true,
  },
  {
    ...baseAccount(120, accountingLocale.header_trade_receivables_name),
    code: '102001',
    type: 'asset',
    subType: 'receivables',
    isControlAccount: true,
    controlAccountId: accountId(101),
  },
  {
    ...baseAccount(121, accountingLocale.header_statutory_receivables_name),
    code: '102002',
    type: 'asset',
    subType: 'receivables',
    isControlAccount: true,
    controlAccountId: accountId(101),
  },
  {
    ...baseAccount(122, accountingLocale.header_trade_payables_name),
    code: '201001',
    type: 'liability',
    subType: 'payable',
    isControlAccount: true,
    controlAccountId: accountId(103),
  },
  {
    ...baseAccount(123, accountingLocale.header_statutory_payables_name),
    code: '201002',
    type: 'liability',
    subType: 'payable',
    isControlAccount: true,
    controlAccountId: accountId(103),
  },
];
export const postings: ILedgerAccountDto[] = [
  {
    ...baseAccount(
      200,
      accountingLocale.bootstrap_statutory_receivables_default_name
    ),
    type: 'asset',
    subType: 'receivables',
    behavior: 'statutory_receivable',
    controlAccountId: accountId(121),
  },
  {
    ...baseAccount(
      201,
      accountingLocale.bootstrap_statutory_payables_default_name
    ),
    type: 'liability',
    subType: 'payable',
    behavior: 'tax_payable',
    controlAccountId: accountId(123),
  },
  {
    ...baseAccount(202, accountingLocale.bootstrap_services_default_name),
    type: 'revenue',
    subType: 'services',
    behavior: 'services',
    controlAccountId: accountId(106),
  },
  {
    ...baseAccount(
      203,
      accountingLocale.bootstrap_employment_income_default_name
    ),
    type: 'revenue',
    subType: 'employment_income',
    behavior: 'employment_income',
    controlAccountId: accountId(107),
  },
  {
    ...baseAccount(
      204,
      accountingLocale.bootstrap_gain_on_sale_of_assets_default_name
    ),
    type: 'revenue',
    subType: 'gain_on_asset_sale',
    behavior: 'gain_on_asset_sale',
    controlAccountId: accountId(108),
  },
  {
    ...baseAccount(
      205,
      accountingLocale.bootstrap_unrealized_gains_default_name
    ),
    type: 'revenue',
    subType: 'unrealized_gains',
    behavior: 'unrealized_gains',
    controlAccountId: accountId(109),
  },
  {
    ...baseAccount(206, accountingLocale.bootstrap_grants_default_name),
    type: 'revenue',
    subType: 'grants',
    behavior: 'grants',
    controlAccountId: accountId(110),
  },
  {
    ...baseAccount(207, accountingLocale.bootstrap_gifts_default_name),
    type: 'revenue',
    subType: 'gifts',
    behavior: 'gifts',
    controlAccountId: accountId(111),
  },
  {
    ...baseAccount(208, accountingLocale.bootstrap_direct_costs_default_name),
    type: 'expense',
    subType: 'direct_costs',
    behavior: 'default_direct_cost',
    controlAccountId: accountId(112),
  },
  {
    ...baseAccount(
      209,
      accountingLocale.bootstrap_rent_and_utilities_default_name
    ),
    type: 'expense',
    subType: 'rent_and_utilities',
    behavior: 'rent_and_utilities',
    controlAccountId: accountId(113),
  },
  {
    ...baseAccount(210, accountingLocale.bootstrap_bank_charge_default_name),
    type: 'expense',
    subType: 'bank_charge',
    behavior: 'bank_charge',
    controlAccountId: accountId(114),
  },
  {
    ...baseAccount(211, accountingLocale.bootstrap_finance_cost_default_name),
    type: 'expense',
    subType: 'finance_cost',
    behavior: 'finance_cost',
    controlAccountId: accountId(115),
  },
  {
    ...baseAccount(212, accountingLocale.bootstrap_interest_default_name),
    type: 'expense',
    subType: 'interest',
    behavior: 'interest',
    controlAccountId: accountId(116),
  },
  {
    ...baseAccount(213, accountingLocale.bootstrap_tax_expense_default_name),
    type: 'expense',
    subType: 'income_tax_expense',
    behavior: 'tax_expense',
    controlAccountId: accountId(117),
  },
  {
    ...baseAccount(
      214,
      accountingLocale.bootstrap_unrealized_loss_default_name
    ),
    type: 'expense',
    subType: 'unrealized_loss',
    behavior: 'unrealized_loss',
    controlAccountId: accountId(118),
  },
  {
    ...baseAccount(
      215,
      accountingLocale.bootstrap_asset_disposal_loss_default_name
    ),
    type: 'expense',
    subType: 'loss_on_asset_disposal',
    behavior: 'asset_disposal_loss',
    controlAccountId: accountId(119),
  },
  {
    ...baseAccount(216, accountingLocale.bootstrap_asset_suspense_account_name),
    type: 'asset',
    subType: 'suspense',
    behavior: 'default',
  },
  {
    ...baseAccount(
      217,
      accountingLocale.bootstrap_liability_suspense_account_name
    ),
    type: 'liability',
    subType: 'suspense',
    behavior: 'default',
  },
];

import type { Page } from '@playwright/test';

interface IOnboardingMockOptions {
  failHeader?: boolean;
  failPostingIndex?: number;
  failRefresh?: boolean;
  initialEntity?: boolean;
  beforePosting?: (index: number) => Promise<void>;
}
interface IRequestRecord {
  path: string;
  method: string;
  body?: unknown;
  entityId?: string;
}

interface IOnboardingMockState {
  entityCreated: boolean;
  activeEntity: IAccountingEntity;
  headersCreated: boolean;
  createdAccounts: ILedgerAccountDto[];
  calls: IRequestRecord[];
  failed: boolean;
}

export async function registerOnboardingRoutes(
  page: Page,
  options: IOnboardingMockOptions = {}
) {
  const state: IOnboardingMockState = {
    entityCreated: options.initialEntity ?? false,
    activeEntity: { ...entity },
    headersCreated: false,
    createdAccounts: [],
    calls: [],
    failed: false,
  };
  const failure = {
    name: 'AccountingError',
    errorKey: 'accounting_error_accounting_entity_type_invalid',
    validationErrors: [],
  };
  const log = (
    path: string,
    method: string,
    body?: unknown,
    entityId?: string
  ) => state.calls.push({ path, method, body, entityId });
  await page.route(
    '**/api/v1/accounting/accounting-entities',
    async (route) => {
      log('/accounting/accounting-entities', 'GET');
      if (options.failRefresh && state.createdAccounts.length === 18) {
        await route.fulfill({ status: 500, json: failure });
        return;
      }
      await route.fulfill({
        json: state.entityCreated ? [state.activeEntity] : [],
      });
    }
  );
  await page.route('**/api/v1/accounting/accounting-entity', async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === 'GET') {
      log('/accounting/accounting-entity', method);
      await route.fulfill({
        status: state.entityCreated ? 200 : 404,
        json: state.entityCreated ? state.activeEntity : failure,
      });
      return;
    }
    const body = request.postDataJSON() as IAccountingEntityCreationDto;
    log('/accounting/accounting-entity', method, body);
    state.activeEntity = {
      ...entity,
      name: body.name,
      type: body.entityType,
      functionalCurrencyCode: body.functionalCurrencyCode,
      jurisdictionCode: body.jurisdictionCode,
    };
    state.entityCreated = true;
    await route.fulfill({ status: 201, json: state.activeEntity });
  });
  await page.route('**/api/v1/users/preferences', async (route) => {
    await route.fulfill({
      json: {
        userId,
        createdBy: userId,
        lastActiveAccountingEntityId: state.entityCreated ? entity.id : null,
        appPreferences: { appUsageMode: 'non_power_user' },
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
  });
  await page.route('**/api/v1/accounts/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    if (request.method() === 'GET') {
      log(path, 'GET');
      await route.fulfill({ json: catalog });
      return;
    }
    const body = request.postDataJSON() as { name: string };
    const index = postings.findIndex((record) => record.name === body.name);
    log(path, 'POST', body, request.headers()['x-accounting-entity-id']);
    await options.beforePosting?.(index);
    if (index < 0) {
      await route.fulfill({ status: 400, json: failure });
      return;
    }
    const template = postings[index];
    const row = {
      ...template,
      balance: {
        ...template.balance,
        currencyCode: state.activeEntity.functionalCurrencyCode,
      },
      functionalBalance: {
        ...template.functionalBalance,
        currencyCode: state.activeEntity.functionalCurrencyCode,
      },
    };
    const fail = options.failPostingIndex === index && !state.failed;
    if (!fail) state.createdAccounts.push(row);
    if (fail) {
      state.failed = true;
      await route.fulfill({ status: 500, json: failure });
      return;
    }
    await route.fulfill({ status: 201, json: row });
  });
  await page.route('**/api/v1/ledger/header-accounts/setup', async (route) => {
    log(
      '/ledger/header-accounts/setup',
      'POST',
      route.request().postDataJSON(),
      route.request().headers()['x-accounting-entity-id']
    );
    const fail = options.failHeader && !state.failed;
    if (!fail) state.headersCreated = true;
    if (fail) {
      state.failed = true;
      await route.fulfill({ status: 500, json: failure });
      return;
    }
    await route.fulfill({ status: 201, json: headers });
  });
  return state;
}
