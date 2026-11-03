import type { UIntervalSelection } from '@/shared/components/interval-select';
import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { differenceInCalendarDays, parseISO } from 'date-fns';

function toRange(selection: UIntervalSelection): IDateRangeDto | undefined {
  if (!selection.startDate || !selection.endDate) {
    return undefined;
  }

  return {
    from: dateUtils.formatDateForApi(selection.startDate),
    to: dateUtils.formatDateForApi(selection.endDate),
  };
}

function isTooLong(range?: IDateRangeDto): boolean {
  return Boolean(
    range &&
    differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) >= 366
  );
}

const reportingIntervalSelectHelpers = Object.freeze({
  toRange,
  isTooLong,
});

export default reportingIntervalSelectHelpers;
