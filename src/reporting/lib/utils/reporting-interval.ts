import type {
  IInterval,
  UIntervalSelection,
} from '@/shared/components/interval-select';
import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { differenceInCalendarDays, parseISO } from 'date-fns';

function toRange(
  selection?: UIntervalSelection,
  interval?: IInterval
): IDateRangeDto | undefined {
  if (!selection || !interval) {
    return undefined;
  }

  let dates = selection;
  if (selection.type === 'period') {
    const period = interval.periods.find(
      (item) => item.ordinal === selection.ordinal
    );

    if (!period) {
      return undefined;
    }

    dates = {
      type: 'period',
      ordinal: period.ordinal,
      startDate: period.startDate,
      endDate: period.endDate,
    };
  } else if (selection.type === 'all-time') {
    dates = {
      type: 'custom',
      startDate: interval.startDate,
      endDate: interval.endDate,
    };
  }

  const { startDate, endDate } = dates;
  if (
    !startDate ||
    !endDate ||
    !dateUtils.isValidDate(startDate) ||
    !dateUtils.isValidDate(endDate)
  ) {
    return undefined;
  }

  const from = dateUtils.formatDateForApi(startDate);
  const to = dateUtils.formatDateForApi(endDate);
  if (
    from > to ||
    (interval.startDate &&
      from < dateUtils.formatDateForApi(interval.startDate)) ||
    (interval.endDate && to > dateUtils.formatDateForApi(interval.endDate))
  ) {
    return undefined;
  }

  return { from, to };
}

function isTooLong(range?: IDateRangeDto): boolean {
  return Boolean(
    range &&
    differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) >= 366
  );
}

function bucketDays(range?: IDateRangeDto): number {
  if (!range) {
    return 1;
  }

  const days =
    differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1;

  return Math.max(1, Math.ceil(days / 12));
}

const reportingIntervalUtils = Object.freeze({
  toRange,
  isTooLong,
  bucketDays,
});

export default reportingIntervalUtils;
