import translations from '@/onboarding/i18n/locales/en/onboarding.json';
import helpers from '@/onboarding/pages/accounting-entity-onboarding/helper';
import type { IJurisdictionDto } from '@/shared/lib/api/Api';
import { createInstance } from 'i18next';
import { describe, expect, it } from 'vitest';

const entity = {
  name: 'Ada',
  entityType: 'individual' as const,
  jurisdictionCode: 'NG',
  functionalCurrencyCode: 'NGN',
};

const jurisdiction: IJurisdictionDto = {
  code: 'NG',
  name: 'Nigeria',
  currencyCode: 'NGN',
  maxFiscalMonths: 23,
  accountingStandards: {
    individual: ['IFRS', 'IFRS_SME'],
    sole_trader: [],
    private_company: [],
  },
};

describe('onboarding helpers', () => {
  it('chooses the first permitted standard for the selected entity type', () => {
    expect(helpers.getAccountingStandard(entity, [jurisdiction])).toBe('IFRS');
    expect(
      helpers.getAccountingStandard({ ...entity, entityType: 'sole_trader' }, [
        jurisdiction,
      ])
    ).toBeUndefined();
    expect(helpers.getAccountingStandard(entity, [])).toBeUndefined();
    expect(
      helpers.getAccountingStandard(entity, [
        {
          ...jurisdiction,
          accountingStandards: {
            ...jurisdiction.accountingStandards,
            individual: ['unknown', 'IFRS'],
          },
        },
      ])
    ).toBeUndefined();
  });
  it('provides translated system aliases for all required headers', async () => {
    const i18n = createInstance();
    await i18n.init({
      lng: 'en',
      resources: { en: { onboarding: translations } },
    });

    const aliases = helpers.createHeaderAliases(
      i18n.getFixedT('en', 'onboarding')
    );

    expect(Object.keys(aliases)).toHaveLength(24);
    expect(aliases).toMatchObject({
      services: 'Services',
      employment_income: 'Employment Income',
      direct_costs: 'Direct Costs',
      bank_charge: 'Bank Charge',
      rent_and_utilities: 'Rent and Utilities',
    });
    expect(
      Object.values(aliases).every(
        (name) => name && !name.startsWith('header_')
      )
    ).toBe(true);
  });
});
