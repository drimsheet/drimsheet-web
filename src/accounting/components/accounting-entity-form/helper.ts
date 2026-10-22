import type { IAccountingEntityFormValues } from './types';

function createInitialValues(
  values: Partial<IAccountingEntityFormValues> = {}
): IAccountingEntityFormValues {
  return {
    entityType: values.entityType ?? '',
    name: values.name ?? '',
    jurisdictionCode: values.jurisdictionCode ?? '',
    functionalCurrencyCode: values.functionalCurrencyCode ?? '',
  };
}

const accountingEntityFormHelpers = Object.freeze({ createInitialValues });

export default accountingEntityFormHelpers;
