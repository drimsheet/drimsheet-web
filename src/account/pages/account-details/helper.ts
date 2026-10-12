import currencies from '@/shared/configs/currencies.json';
import type {
  IAccountCashFlowDto,
  IGetAccountCashFlowQuery,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';

function toMajorUnits(value: IMoneyDto) {
  if (!value.isMinorUnit) return value.amount;

  const currency = currencies.find(
    ({ code }) => code.toLowerCase() === value.currencyCode.toLowerCase()
  );

  return value.amount / 10 ** (currency?.minorUnit ?? 0);
}

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

function chartData(cashFlow: IAccountCashFlowDto, locale: string) {
  return cashFlow.buckets.map((bucket) => ({
    label: formatDate(bucket.from, locale, { day: 'numeric', month: 'short' }),
    range: `${formatDate(bucket.from, locale)} – ${formatDate(bucket.to, locale)}`,
    moneyIn: toMajorUnits(bucket.moneyIn),
    moneyOut: toMajorUnits(bucket.moneyOut),
  }));
}

const accountDetailsHelpers = Object.freeze({
  toMajorUnits,
  formatDate,
  periodQuery,
  periodOptions,
  chartData,
});

export default accountDetailsHelpers;
