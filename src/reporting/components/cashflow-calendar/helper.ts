import type { IMoneyDto } from '@/shared/lib/api/Api';
import { toMajorUnits } from '@/shared/lib/utils/money';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { UCashflowCalendarVariant } from './types';

function periodStart(date: Date, variant: UCashflowCalendarVariant) {
  return variant === 'month'
    ? startOfMonth(date)
    : startOfWeek(date, { weekStartsOn: 1 });
}

function weeks(date: Date, variant: UCashflowCalendarVariant) {
  const start = startOfWeek(periodStart(date, variant), { weekStartsOn: 1 });

  const end = endOfWeek(variant === 'month' ? endOfMonth(date) : date, {
    weekStartsOn: 1,
  });

  const rows: (Date | null)[][] = [];
  for (let cursor = start; cursor <= end; cursor = addWeeks(cursor, 1)) {
    rows.push(
      Array.from({ length: 7 }, (_, index) => {
        const day = addDays(cursor, index);

        return variant === 'month' && !isSameMonth(day, date) ? null : day;
      })
    );
  }

  return rows;
}

function move(
  date: Date,
  variant: UCashflowCalendarVariant,
  direction: number
) {
  const start = periodStart(date, variant);

  return variant === 'month'
    ? addMonths(start, direction)
    : addWeeks(start, direction);
}

function title(date: Date, variant: UCashflowCalendarVariant, locale: string) {
  if (variant === 'month') {
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  const start = periodStart(date, variant);
  const end = addDays(start, 6);

  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function dateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function compactMoney(
  money: IMoneyDto,
  locale: string,
  direction: 'in' | 'out'
) {
  const amount = toMajorUnits(money);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(direction === 'out' ? -amount : amount);
}

const cashflowCalendarHelpers = Object.freeze({
  periodStart,
  weeks,
  move,
  title,
  dateKey,
  compactMoney,
});

export default cashflowCalendarHelpers;
