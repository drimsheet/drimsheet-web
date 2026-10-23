import accountingEntityFormHelpers from '@/accounting/components/accounting-entity-form/helper';
import { describe, expect, it } from 'vitest';
describe('accounting entity initial values', () => {
  it('starts with empty fields', () => {
    expect(accountingEntityFormHelpers.createInitialValues()).toEqual({
      entityType: '',
      name: '',
      jurisdictionCode: '',
      functionalCurrencyCode: '',
    });
  });
  it('preserves supplied values and defaults missing fields', () => {
    expect(
      accountingEntityFormHelpers.createInitialValues({
        name: 'Ada',
        jurisdictionCode: 'NG',
      })
    ).toEqual({
      entityType: '',
      name: 'Ada',
      jurisdictionCode: 'NG',
      functionalCurrencyCode: '',
    });
  });
});
