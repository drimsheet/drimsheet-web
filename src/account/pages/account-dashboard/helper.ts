import type { IAccountDashboardBalancePoint } from '@/account/lib/types/account-dashboard.types';
import { toMajorUnits } from '@/shared/lib/utils/money';
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  subMonths,
} from 'date-fns';
import type { IAccountBalanceChange, UBalancePeriod } from './types';

function periodQuery(period: UBalancePeriod, now: Date) {
  const months = { '1M': 1, '6M': 6, '1Y': 12 }[period];
  const candidate = subMonths(now, months);

  const from =
    differenceInCalendarDays(now, candidate) > 365
      ? addDays(candidate, 1)
      : candidate;

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(now, 'yyyy-MM-dd'),
  };
}

function bucketDays(period: UBalancePeriod) {
  return { '1M': 5, '6M': 30, '1Y': 61 }[period];
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseISO(value));
}

function balanceChange(
  points: IAccountDashboardBalancePoint[]
): IAccountBalanceChange | undefined {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);

  if (points.length < 2 || !firstPoint || !lastPoint) return undefined;

  if (firstPoint.amount.currencyCode !== lastPoint.amount.currencyCode)
    return undefined;

  const firstAmount = toMajorUnits(firstPoint.amount);
  const lastAmount = toMajorUnits(lastPoint.amount);
  const change = lastAmount - firstAmount;

  return {
    amount: {
      amount: change,
      currencyCode: lastPoint.amount.currencyCode,
      isMinorUnit: false,
    },
    percentageChange:
      firstAmount === 0 ? null : (change / Math.abs(firstAmount)) * 100,
    date: firstPoint.date,
  };
}

const accountDashboardHelpers = Object.freeze({
  periodQuery,
  bucketDays,
  formatDate,
  balanceChange,
});

export default accountDashboardHelpers;
