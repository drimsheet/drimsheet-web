import type accountingLocale from '@/accounting/i18n/locales/en/accounting.json';
import type { IHeaderAccountNameAliasesReq } from '@/shared/lib/api/Api';

const nameKeys: Record<string, keyof typeof accountingLocale> = {
  'statutory-receivables-default':
    'bootstrap_statutory_receivables_default_name',
  'statutory-payables-default': 'bootstrap_statutory_payables_default_name',
  'services-default': 'bootstrap_services_default_name',
  'employment-income-default': 'bootstrap_employment_income_default_name',
  'gain-on-sale-of-assets-default':
    'bootstrap_gain_on_sale_of_assets_default_name',
  'unrealized-gains-default': 'bootstrap_unrealized_gains_default_name',
  'grants-default': 'bootstrap_grants_default_name',
  'gifts-default': 'bootstrap_gifts_default_name',
  'direct-costs-default': 'bootstrap_direct_costs_default_name',
  'rent-and-utilities-default': 'bootstrap_rent_and_utilities_default_name',
  'bank-charge-default': 'bootstrap_bank_charge_default_name',
  'finance-cost-default': 'bootstrap_finance_cost_default_name',
  'interest-default': 'bootstrap_interest_default_name',
  'tax-expense-default': 'bootstrap_tax_expense_default_name',
  'unrealized-loss-default': 'bootstrap_unrealized_loss_default_name',
  'asset-disposal-loss-default': 'bootstrap_asset_disposal_loss_default_name',
  'asset-suspense-account': 'bootstrap_asset_suspense_account_name',
  'liability-suspense-account': 'bootstrap_liability_suspense_account_name',
};
function accountNameKey(
  key: string
): keyof typeof accountingLocale | undefined {
  return nameKeys[key];
}
function headerNames(
  translate: (key: keyof typeof accountingLocale) => string
): IHeaderAccountNameAliasesReq {
  return {
    cash_and_cash_equivalent: translate('header_cash_and_cash_equivalent_name'),
    receivables: translate('header_receivables_name'),
    short_term_debt: translate('header_short_term_debt_name'),
    payable: translate('header_payable_name'),
    retained_earnings: translate('header_retained_earnings_name'),
    opening_balance: translate('header_opening_balance_name'),
    services: translate('header_services_name'),
    employment_income: translate('header_employment_income_name'),
    gain_on_asset_sale: translate('header_gain_on_asset_sale_name'),
    unrealized_gains: translate('header_unrealized_gains_name'),
    grants: translate('header_grants_name'),
    gifts: translate('header_gifts_name'),
    direct_costs: translate('header_direct_costs_name'),
    rent_and_utilities: translate('header_rent_and_utilities_name'),
    bank_charge: translate('header_bank_charge_name'),
    finance_cost: translate('header_finance_cost_name'),
    interest: translate('header_interest_name'),
    income_tax_expense: translate('header_income_tax_expense_name'),
    unrealized_loss: translate('header_unrealized_loss_name'),
    loss_on_asset_disposal: translate('header_loss_on_asset_disposal_name'),
    trade_receivables: translate('header_trade_receivables_name'),
    statutory_receivables: translate('header_statutory_receivables_name'),
    trade_payables: translate('header_trade_payables_name'),
    statutory_payables: translate('header_statutory_payables_name'),
  };
}
const accountingEntityCreationHelpers = Object.freeze({
  accountNameKey,
  headerNames,
});
export default accountingEntityCreationHelpers;
