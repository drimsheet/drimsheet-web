import type { IGetAccountCashFlowQuery } from '@/shared/lib/api/Api';
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';

function formatDate(
  value: string | Date,
  locale = 'en-GB',
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
) {
  const date = typeof value === 'string' ? parseISO(value) : value;

  return new Intl.DateTimeFormat(locale, options).format(date);
}

function periodQuery(period: string, now: Date): IGetAccountCashFlowQuery {
  const start = parseISO(`${period}-01`);
  const end = endOfMonth(start);

  return {
    from: format(start, 'yyyy-MM-dd'),
    to: format(end > now ? now : end, 'yyyy-MM-dd'),
    bucketDays: 7,
  };
}

function periodOptions(now: Date, locale: string) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(startOfMonth(now), index);

    return {
      value: format(date, 'yyyy-MM'),
      label: formatDate(date, locale, { month: 'long', year: 'numeric' }),
    };
  });
}

const accountDetailsHelpers = Object.freeze({
  formatDate,
  periodQuery,
  periodOptions,
});

export default accountDetailsHelpers;
