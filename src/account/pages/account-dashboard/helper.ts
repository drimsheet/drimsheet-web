import type { IAccountDashboardMoney } from '@/account/lib/types/account-dashboard.types';
import currencies from '@/shared/configs/currencies.json';
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  subMonths,
} from 'date-fns';
import type {
  BalanceTrendProps,
  IAccountBalanceChange,
  UBalancePeriod,
} from './types';

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

function toMajorUnits(money: IAccountDashboardMoney) {
  const currency = currencies.find(
    ({ code }) => code.toLowerCase() === money.currencyCode.toLowerCase()
  );

  return money.isMinorUnit
    ? money.amount / 10 ** (currency?.minorUnit ?? 0)
    : money.amount;
}

function formatPercentage(value: number | null, locale: string) {
  if (value === null) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseISO(value));
}

function chartData(points: BalanceTrendProps['points'], locale: string) {
  return points.map((point) => ({
    date: point.date,
    label: new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    }).format(parseISO(point.date)),
    amount: toMajorUnits(point.amount),
    money: point.amount,
  }));
}

function balanceChange(
  points: BalanceTrendProps['points']
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

function currencyLogo(currencyCode: string) {
  return currencies.find(
    ({ code }) => code.toLowerCase() === currencyCode.toLowerCase()
  )?.logo;
}

function growthDirection(change: number) {
  if (change === 0) return 'neutral';

  if (change < 0) return 'down';

  return 'up';
}

const accountDashboardHelpers = Object.freeze({
  periodQuery,
  bucketDays,
  toMajorUnits,
  formatPercentage,
  formatDate,
  chartData,
  balanceChange,
  currencyLogo,
  growthDirection,
});

export default accountDashboardHelpers;
