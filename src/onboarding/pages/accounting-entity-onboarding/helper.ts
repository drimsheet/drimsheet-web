import type { IAccountingEntityFormValues } from '@/accounting/components/accounting-entity-form';
import {
  EAccountingStandardCode,
  type IHeaderAccountNameAliasesReq,
  type IJurisdictionDto,
} from '@/shared/lib/api/Api';
import type { TFunction } from 'i18next';

function getAccountingStandard(
  values: IAccountingEntityFormValues,
  jurisdictions: IJurisdictionDto[]
) {
  const jurisdiction = jurisdictions.find(
    ({ code }) => code === values.jurisdictionCode
  );

  const firstStandard = values.entityType
    ? jurisdiction?.accountingStandards[values.entityType][0]
    : undefined;

  return Object.values(EAccountingStandardCode).find(
    (code) => code === firstStandard
  );
}

function createHeaderAliases(
  t: TFunction<'onboarding'>
): IHeaderAccountNameAliasesReq {
  return {
    cash_and_cash_equivalent: t('header_cash_and_cash_equivalent_name'),
    receivables: t('header_receivables_name'),
    short_term_debt: t('header_short_term_debt_name'),
    payable: t('header_payable_name'),
    retained_earnings: t('header_retained_earnings_name'),
    opening_balance: t('header_opening_balance_name'),
    services: t('header_services_name'),
    employment_income: t('header_employment_income_name'),
    gain_on_asset_sale: t('header_gain_on_asset_sale_name'),
    unrealized_gains: t('header_unrealized_gains_name'),
    grants: t('header_grants_name'),
    gifts: t('header_gifts_name'),
    direct_costs: t('header_direct_costs_name'),
    rent_and_utilities: t('header_rent_and_utilities_name'),
    bank_charge: t('header_bank_charge_name'),
    finance_cost: t('header_finance_cost_name'),
    interest: t('header_interest_name'),
    income_tax_expense: t('header_income_tax_expense_name'),
    unrealized_loss: t('header_unrealized_loss_name'),
    loss_on_asset_disposal: t('header_loss_on_asset_disposal_name'),
    trade_receivables: t('header_trade_receivables_name'),
    statutory_receivables: t('header_statutory_receivables_name'),
    trade_payables: t('header_trade_payables_name'),
    statutory_payables: t('header_statutory_payables_name'),
  };
}

const accountingEntityOnboardingHelpers = Object.freeze({
  getAccountingStandard,
  createHeaderAliases,
});

export default accountingEntityOnboardingHelpers;
