import dayjs from 'dayjs';
import type {
  IFinancialYearFormValues,
  IFinancialYearPeriod,
  TPeriodNameFactory,
} from './types';

function isValidDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    dayjs(value).isValid() &&
    dayjs(value).format('YYYY-MM-DD') === value
  );
}

function isValidRange(
  startDate: string,
  endDate: string,
  maxFiscalMonths: number
) {
  return (
    isValidDate(startDate) &&
    isValidDate(endDate) &&
    endDate >= startDate &&
    dayjs(endDate).isBefore(
      dayjs(startDate).add(maxFiscalMonths, 'month'),
      'day'
    )
  );
}

function createPeriods(
  values: Pick<IFinancialYearFormValues, 'startDate' | 'endDate' | 'unit'>,
  createName: TPeriodNameFactory,
  maxFiscalMonths: number,
  previousPeriods: IFinancialYearPeriod[] = []
): IFinancialYearPeriod[] {
  const { startDate, endDate, unit } = values;
  if (!isValidRange(startDate, endDate, maxFiscalMonths)) return [];

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const periods: IFinancialYearPeriod[] = [];
  let periodStart = start;
  let index = 0;

  while (!periodStart.isAfter(end, 'day')) {
    index += 1;
    let next = end.add(1, 'day');
    if (unit === 'day') next = start.add(index, 'day');

    if (unit === 'week') next = start.add(index * 7, 'day');

    if (unit === 'month') next = start.add(index, 'month');

    if (unit === 'quarter') next = start.add(index * 3, 'month');

    const periodEnd = next.isAfter(end) ? end : next.subtract(1, 'day');
    const rangeStart = periodStart.format('YYYY-MM-DD');
    const rangeEnd = periodEnd.format('YYYY-MM-DD');

    const previous = previousPeriods.find(
      (period) => period.startDate === rangeStart && period.endDate === rangeEnd
    );

    periods.push({
      startDate: rangeStart,
      endDate: rangeEnd,
      name: previous?.name ?? createName(unit, index),
    });
    periodStart = next;
  }

  return periods;
}

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
    periods: createPeriods(
      initial,
      createName,
      maxFiscalMonths,
      values.periods
    ),
  };
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

const financialYearFormHelpers = Object.freeze({
  isValidDate,
  isValidRange,
  createPeriods,
  createInitialValues,
  formatDate,
});

export default financialYearFormHelpers;
