import type { IDateRange } from '@/shared/components/date-range-picker';
import { dateUtils } from '@/shared/lib/utils/date';
import dayjs from 'dayjs';
import type { DateRange } from 'react-day-picker';
import type { IInterval, UIntervalSelection } from './types';

function hasAllTime(interval?: IInterval): interval is IInterval & {
  startDate: Date;
  endDate: Date;
} {
  return Boolean(interval?.startDate && interval.endDate);
}

function fromOption(value: string, interval?: IInterval): UIntervalSelection {
  if (value === 'all-time' && hasAllTime(interval)) {
    return {
      type: 'all-time',
      startDate: interval.startDate,
      endDate: interval.endDate,
    };
  }

  const period = interval?.periods.find(
    (item) => `period:${item.ordinal}` === value
  );

  if (period) {
    return {
      type: 'period',
      ordinal: period.ordinal,
      startDate: period.startDate,
      endDate: period.endDate,
    };
  }

  return { type: 'custom' };
}

function initial(interval?: IInterval): UIntervalSelection {
  const period = interval?.periods.find(
    (item) => item.ordinal === interval.currentPeriodOrdinal
  );

  if (period) {
    return fromOption(`period:${period.ordinal}`, interval);
  }

  return fromOption(hasAllTime(interval) ? 'all-time' : 'custom', interval);
}

function fromRange(
  range: DateRange | undefined,
  interval?: IInterval
): UIntervalSelection {
  const startDate = range?.from;
  const endDate = range?.to;
  const dates = [startDate, endDate].filter((date) => date !== undefined);

  const outsideBounds = dates.some(
    (date) =>
      !dateUtils.isValidDate(date) ||
      (interval?.startDate &&
        dayjs(date).isBefore(interval.startDate, 'day')) ||
      (interval?.endDate && dayjs(date).isAfter(interval.endDate, 'day'))
  );

  if (outsideBounds || (startDate && endDate && startDate > endDate)) {
    return { type: 'custom' };
  }

  return { type: 'custom', startDate, endDate };
}

function reconcile(
  selection: UIntervalSelection,
  interval?: IInterval
): UIntervalSelection {
  if (selection.type === 'period') {
    const period = interval?.periods.find(
      (item) => item.ordinal === selection.ordinal
    );

    return period
      ? fromOption(`period:${period.ordinal}`, interval)
      : initial(interval);
  }

  if (selection.type === 'all-time') {
    return hasAllTime(interval)
      ? fromOption('all-time', interval)
      : initial(interval);
  }

  return fromRange(
    { from: selection.startDate, to: selection.endDate },
    interval
  );
}

function key(selection: UIntervalSelection): string {
  const ordinal = selection.type === 'period' ? selection.ordinal : '';

  return `${selection.type}:${ordinal}:${selection.startDate?.getTime() ?? ''}:${selection.endDate?.getTime() ?? ''}`;
}

function withRange(
  selection: UIntervalSelection,
  range: Partial<IDateRange>
): UIntervalSelection {
  const sameStart =
    selection.startDate &&
    range.startDate &&
    dayjs(selection.startDate).isSame(range.startDate, 'day');

  const sameEnd =
    selection.endDate &&
    range.endDate &&
    dayjs(selection.endDate).isSame(range.endDate, 'day');

  if (selection.type !== 'custom' && sameStart && sameEnd) {
    return selection;
  }

  return { type: 'custom', startDate: range.startDate, endDate: range.endDate };
}

function pickerKey(
  selection: UIntervalSelection,
  interval?: IInterval
): string {
  return JSON.stringify([
    key(selection),
    interval?.startDate?.getTime(),
    interval?.endDate?.getTime(),
    interval?.currentPeriodOrdinal,
    interval?.periods.map((period) => [
      period.ordinal,
      period.startDate.getTime(),
      period.endDate.getTime(),
    ]),
  ]);
}

const intervalSelectHelpers = Object.freeze({
  hasAllTime,
  fromOption,
  initial,
  fromRange,
  reconcile,
  key,
  withRange,
  pickerKey,
});

export default intervalSelectHelpers;
