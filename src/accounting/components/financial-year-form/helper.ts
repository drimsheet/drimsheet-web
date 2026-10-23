import type { TPeriodNameFactory } from '@/accounting/lib/types/period.types';
import { accountingPeriodUtils } from '@/accounting/lib/utils/accounting-periods';
import dayjs from 'dayjs';
import type { IFinancialYearFormValues } from './types';

function createInitialValues(
  currentDate: string,
  createName: TPeriodNameFactory,
  maxFiscalMonths: number,
  values: Partial<IFinancialYearFormValues> = {}
): IFinancialYearFormValues {
  const year = dayjs(currentDate);

  const initial = {
    name: values.name ?? '',
    startDate: values.startDate ?? year.startOf('year').format('YYYY-MM-DD'),
    endDate: values.endDate ?? year.endOf('year').format('YYYY-MM-DD'),
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

const financialYearFormHelpers = Object.freeze({ createInitialValues });
export default financialYearFormHelpers;
