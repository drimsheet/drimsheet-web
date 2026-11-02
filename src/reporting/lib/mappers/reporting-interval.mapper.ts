import type { IInterval, IPeriod } from '@/shared/components/interval-select';
import type {
  IReportingInterval,
  IReportingPeriod,
} from '@/shared/lib/api/Api';

function toCalendarDate(value: string, exclusiveEnd = false): Date {
  // Resolve the UTC calendar day before constructing a date in the picker's local timezone.
  // One millisecond before an exclusive end belongs to the last included day.
  const instant = new Date(Date.parse(value) - (exclusiveEnd ? 1 : 0));
  const date = new Date(0);
  date.setFullYear(
    instant.getUTCFullYear(),
    instant.getUTCMonth(),
    instant.getUTCDate()
  );
  date.setHours(0, 0, 0, 0);

  return date;
}

function toPeriod(period: IReportingPeriod): IPeriod {
  return {
    ordinal: period.ordinal,
    name: period.name,
    startDate: toCalendarDate(period.startDate),
    endDate: toCalendarDate(period.endDate, true),
  };
}

function toInterval(interval: IReportingInterval): IInterval {
  return {
    startDate: toCalendarDate(interval.startDate),
    endDate: toCalendarDate(interval.endDate, true),
    currentPeriodOrdinal: interval.currentPeriodOrdinal,
    periods: interval.periods.map(toPeriod),
  };
}

const reportingIntervalMapper = Object.freeze({ toInterval });

export default reportingIntervalMapper;
