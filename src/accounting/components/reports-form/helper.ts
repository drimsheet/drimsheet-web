import type {
  INamedPeriod,
  TPeriodNameFactory,
} from '@/accounting/lib/types/period.types';
import { accountingPeriodUtils } from '@/accounting/lib/utils/accounting-periods';
import type { UReportingIntervalUnit } from '@/shared/lib/api/Api';
import type {
  IReportsFormFields,
  IReportsFormValues,
  ReportsFormProps,
} from './types';

function periodKey(
  unit: UReportingIntervalUnit,
  period: Pick<INamedPeriod, 'startDate' | 'endDate'>
) {
  return `${unit}_${period.startDate}_${period.endDate}`;
}

function createInitialValues(
  values: Partial<IReportsFormValues> = {}
): IReportsFormFields {
  const unit = values.unit ?? 'quarter';

  return {
    name: values.name ?? '',
    currencyCode: values.currencyCode ?? '',
    unit,
    periodNames: Object.fromEntries(
      (values.periods ?? []).map((period) => [
        periodKey(unit, period),
        period.name,
      ])
    ),
  };
}

function createPeriods(
  values: IReportsFormFields,
  financialYear: ReportsFormProps['financialYear'],
  createName: TPeriodNameFactory<UReportingIntervalUnit>,
  maxFiscalMonths: number
) {
  const periods = accountingPeriodUtils.createPeriods(
    {
      startDate: financialYear.startDate,
      endDate: financialYear.endDate,
      unit: values.unit,
    },
    createName,
    maxFiscalMonths
  );

  return periods.map((period) => {
    const key = periodKey(values.unit, period);

    return {
      ...period,
      // Formik converts cleared strings to undefined before schema validation.
      name: Object.hasOwn(values.periodNames, key)
        ? (values.periodNames[key] ?? '')
        : period.name,
    };
  });
}

const reportsFormHelpers = Object.freeze({
  periodKey,
  createInitialValues,
  createPeriods,
});

export default reportsFormHelpers;
