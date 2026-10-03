import locale from '@/accounting/i18n/locales/en/accounting.json';
import { accountingBootstrapMapper as mapper } from '@/accounting/lib/mappers/accounting-bootstrap.mapper';
import { describe, expect, it } from 'vitest';
describe('accountingBootstrapMapper', () => {
  it('maps statutory receivables without a client-selected parent', () => {
    expect(
      mapper.toReceivable(
        locale.bootstrap_statutory_receivables_default_name,
        'USD'
      )
    ).toEqual({
      name: locale.bootstrap_statutory_receivables_default_name,
      isControlAccount: false,
      currencyCode: 'USD',
    });
  });
  it('maps statutory payables with null metadata and no parent', () => {
    expect(
      mapper.toPayable(locale.bootstrap_statutory_payables_default_name, 'USD')
    ).toEqual({
      name: locale.bootstrap_statutory_payables_default_name,
      isControlAccount: false,
      currencyCode: 'USD',
      meta: null,
    });
  });
  it('maps revenue with the localized name and supported behavior', () => {
    expect(
      mapper.toRevenue(locale.bootstrap_services_default_name, 'services')
    ).toEqual({
      name: locale.bootstrap_services_default_name,
      isControlAccount: false,
      behavior: 'services',
    });
  });
  it('maps expenses without currency or parent fields', () => {
    expect(
      mapper.toExpense(
        locale.bootstrap_direct_costs_default_name,
        'default_direct_cost'
      )
    ).toEqual({
      name: locale.bootstrap_direct_costs_default_name,
      isControlAccount: false,
      behavior: 'default_direct_cost',
    });
  });
  it.each(['asset', 'liability'] as const)(
    'maps %s suspense with only its supported fields',
    (type) => {
      const name = locale.bootstrap_asset_suspense_account_name;
      expect(mapper.toSuspense(name, type, 'USD')).toEqual({
        name,
        type,
        currencyCode: 'USD',
      });
    }
  );
});
