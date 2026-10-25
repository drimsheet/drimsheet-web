import { toMajorUnits } from '@/shared/lib/utils/money';
import { parseISO } from 'date-fns';
import type { BalanceTrendProps } from './types';

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

const balanceTrendHelpers = Object.freeze({ chartData, formatDate });
export default balanceTrendHelpers;
