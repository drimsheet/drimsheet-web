import type { IAccountingEntityFormValues } from '@/accounting/components/accounting-entity-creation-form';
import {
  EPeriodUnit,
  type IAccountingEntityCreationDto,
  type UAccountingEntityType,
  type UAccountingStandardCode,
  type UCurrencyCode,
  type UJurisdictionCode,
} from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';

function toAccountingEntityCreationDto(
  values: IAccountingEntityFormValues
): IAccountingEntityCreationDto {
  const fiscalYearStart = values.fiscalYearStart!;
  const fiscalYearEnd = values.fiscalYearEnd!;

  const periodCount = dateUtils.getDurationInMonths(
    fiscalYearStart,
    fiscalYearEnd
  );

  return {
    name: values.name,
    entityType: values.entityType as UAccountingEntityType,
    jurisdictionCode: values.countryCode as UJurisdictionCode,
    accountingStandardCode:
      values.accountingStandardCode as UAccountingStandardCode,
    functionalCurrencyCode: values.functionalCurrency as UCurrencyCode,
    reportingCurrencyCode: values.reportingCurrency as UCurrencyCode,
    fiscalYear: {
      startDate: dateUtils.formatDateForApi(fiscalYearStart),
      endDate: dateUtils.formatDateForApi(fiscalYearEnd),
    },
    accountingPeriod: {
      unit: EPeriodUnit.Month,
      count: periodCount,
    },
    reportingPeriod: {
      unit: EPeriodUnit.Month,
      count: periodCount,
    },
    appPreferences: {
      appUsageMode: values.appUsageMode,
    },
  };
}

export const accountingEntityMapper = Object.freeze({
  toAccountingEntityCreationDto,
});
