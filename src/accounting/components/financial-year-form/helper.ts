import { FISCAL_YEAR_STARTS } from '@/accounting/lib/configs/fiscal-year-start.config';
import type { TPeriodNameFactory } from '@/accounting/lib/types/period.types';
import { accountingPeriodUtils } from '@/accounting/lib/utils/accounting-periods';
import type {
  UAccountingIntervalUnit,
  UJurisdictionCode,
} from '@/shared/lib/api/Api';
import dayjs from 'dayjs';
import type { IFinancialYearFormValues } from './types';

function createInitialValues(
  currentDate: string,
  createName: TPeriodNameFactory<UAccountingIntervalUnit>,
  maxFiscalMonths: number,
  defaultName: string,
  values: Partial<IFinancialYearFormValues> = {},
  jurisdictionCode?: string
): IFinancialYearFormValues {
  const year = dayjs(currentDate);
  const officialDates = getOfficialDates(currentDate, jurisdictionCode);

  const initial = {
    name: values.name ?? defaultName,
    startDate:
      values.startDate ??
      officialDates?.startDate ??
      year.startOf('year').format('YYYY-MM-DD'),
    endDate:
      values.endDate ??
      officialDates?.endDate ??
      year.endOf('year').format('YYYY-MM-DD'),
    unit: values.unit ?? 'quarter',
  };

  return {
    ...initial,
    periods: accountingPeriodUtils.createPeriods(
      initial,
      createName,
      maxFiscalMonths,
      values.periods
    ),
  };
}

function getOfficialDates(currentDate: string, jurisdictionCode?: string) {
  if (!jurisdictionCode || !Object.hasOwn(FISCAL_YEAR_STARTS, jurisdictionCode))
    return undefined;

  const { month, day } =
    FISCAL_YEAR_STARTS[jurisdictionCode as UJurisdictionCode];

  const start = dayjs(currentDate)
    .startOf('year')
    .month(month - 1)
    .date(day);

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: start.add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD'),
  };
}

function getDateRestrictions(startDate: string, endDate: string) {
  return {
    start: accountingPeriodUtils.isValidDate(endDate)
      ? { after: dayjs(endDate).toDate() }
      : undefined,
    end: accountingPeriodUtils.isValidDate(startDate)
      ? { before: dayjs(startDate).toDate() }
      : undefined,
  };
}

const financialYearFormHelpers = Object.freeze({
  createInitialValues,
  getDateRestrictions,
  getOfficialDates,
});

export default financialYearFormHelpers;
