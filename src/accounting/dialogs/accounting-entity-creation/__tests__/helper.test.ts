import helpers from '@/accounting/dialogs/accounting-entity-creation/helper';
import locale from '@/accounting/i18n/locales/en/accounting.json';
import { describe, expect, it } from 'vitest';
describe('accountingEntityCreationHelpers', () => {
  it('resolves posting name keys and leaves unsupported records unresolved', () => {
    expect(helpers.accountNameKey('services-default')).toBe(
      'bootstrap_services_default_name'
    );
    expect(helpers.accountNameKey('unknown')).toBeUndefined();
    expect(helpers.accountNameKey('asset-suspense-account')).toBe(
      'bootstrap_asset_suspense_account_name'
    );
  });
  it('translates all header aliases without account-code inference', () => {
    const names = helpers.headerNames((key) => locale[key]);
    expect(Object.keys(names)).toHaveLength(24);
    expect(names).toEqual(
      expect.objectContaining({
        services: locale.header_services_name,
        statutory_payables: locale.header_statutory_payables_name,
        retained_earnings: locale.header_retained_earnings_name,
      })
    );
    expect(names).not.toHaveProperty('controlAccountCode');
    expect(
      Object.values(helpers.headerNames((key) => `translated:${key}`)).every(
        (name) => name.startsWith('translated:')
      )
    ).toBe(true);
  });
});
