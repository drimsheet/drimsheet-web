import type { IAccountDashboardBalancePoint } from '@/account/lib/types/account-dashboard.types';
import { toMajorUnits } from '@/shared/lib/utils/money';
import { parseISO } from 'date-fns';
import type { IAccountBalanceChange } from './types';

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

  if (points.length < 2 || !firstPoint || !lastPoint) {
    return undefined;
  }

  if (firstPoint.amount.currencyCode !== lastPoint.amount.currencyCode) {
    return undefined;
  }

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
  formatDate,
  balanceChange,
});

export default accountDashboardHelpers;
