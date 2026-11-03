import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { differenceInCalendarDays, parseISO } from 'date-fns';

function bucketDays(range?: IDateRangeDto): number {
  if (!range) {
    return 1;
  }

  const days =
    differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1;

  return Math.max(1, Math.ceil(days / 12));
}

const reportRangeUtils = Object.freeze({ bucketDays });

export default reportRangeUtils;
