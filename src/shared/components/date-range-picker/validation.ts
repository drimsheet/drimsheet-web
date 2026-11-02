import dayjs from 'dayjs';
import dateRangePickerHelpers from './helper';
import type { IDateRangeDraft, UDateRangeError } from './types';

export function getDateRangeError(
  draft: IDateRangeDraft,
  minDate?: Date,
  maxDate?: Date
): UDateRangeError | undefined {
  if (!draft.startDate || !draft.endDate) {
    return 'date_range_picker_incomplete_error';
  }

  const { startDate, endDate } = dateRangePickerHelpers.toRange(draft);

  if (!startDate || !endDate) {
    return 'date_range_picker_invalid_date_error';
  }

  if (startDate > endDate) {
    return 'date_range_picker_order_error';
  }

  if (
    (minDate &&
      (!dayjs(minDate).isValid() ||
        dayjs(startDate).isBefore(minDate, 'day'))) ||
    (maxDate &&
      (!dayjs(maxDate).isValid() || dayjs(endDate).isAfter(maxDate, 'day')))
  ) {
    return 'date_range_picker_bounds_error';
  }

  return undefined;
}
