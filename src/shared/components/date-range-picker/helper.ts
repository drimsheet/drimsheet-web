import { dateUtils } from '@/shared/lib/utils/date';
import type { IDateRange, IDateRangeDraft } from './types';

function parse(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1) {
    return undefined;
  }

  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function inputValue(date?: Date): string {
  return date && dateUtils.isValidDate(date)
    ? dateUtils.formatDateForApi(date)
    : '';
}

function toDraft(value?: Partial<IDateRange>): IDateRangeDraft {
  return {
    startDate: inputValue(value?.startDate),
    endDate: inputValue(value?.endDate),
  };
}

function toRange(draft: IDateRangeDraft): Partial<IDateRange> {
  return { startDate: parse(draft.startDate), endDate: parse(draft.endDate) };
}

function key(value?: IDateRange, minDate?: Date, maxDate?: Date): string {
  return [
    inputValue(value?.startDate),
    inputValue(value?.endDate),
    inputValue(minDate),
    inputValue(maxDate),
  ].join(':');
}

function initialMonth(
  value?: Partial<IDateRange>,
  minDate?: Date,
  maxDate?: Date
): Date | undefined {
  return [value?.startDate, value?.endDate, minDate, maxDate].find(
    (date) => date && dateUtils.isValidDate(date)
  );
}

const dateRangePickerHelpers = Object.freeze({
  parse,
  inputValue,
  toDraft,
  toRange,
  key,
  initialMonth,
});

export default dateRangePickerHelpers;
