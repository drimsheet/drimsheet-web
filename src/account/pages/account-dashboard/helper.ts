import currencies from '@/shared/configs/currencies.json';
import type {
  IAssetLiabilityAccountParticipationDto,
  IDateRangeDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  subMonths,
} from 'date-fns';
import type { IAccountTableRow, IBalancePoint, UBalancePeriod } from './types';

function periodQuery(period: UBalancePeriod, now: Date): IDateRangeDto {
  const months = { '1M': 1, '6M': 6, '1Y': 12 }[period];

  // The report compares period.to with the day before period.from.
  return {
    from: format(addDays(subMonths(now, months), 1), 'yyyy-MM-dd'),
    to: format(now, 'yyyy-MM-dd'),
  };
}

function historyDates(period: IDateRangeDto) {
  const start = addDays(parseISO(period.from), -1);
  const days = differenceInCalendarDays(parseISO(period.to), start);

  // Five real intermediate snapshots; endpoints come from the summary.
  return Array.from({ length: 5 }, (_, index) =>
    format(addDays(start, Math.round((days * (index + 1)) / 6)), 'yyyy-MM-dd')
  );
}

function toMajorUnits(money: IMoneyDto) {
  const currency = currencies.find(
    ({ code }) => code.toLowerCase() === money.currencyCode.toLowerCase()
  );

  return money.isMinorUnit
    ? money.amount / 10 ** (currency?.minorUnit ?? 0)
    : money.amount;
}

function tableRows(
  accounts: IAssetLiabilityAccountParticipationDto[]
): IAccountTableRow[] {
  return accounts.map((account) => ({ ...account, id: account.accountId }));
}

function shareWidth(share: number | null) {
  // Contra balances and zero denominators must not become misleading bars.
  return share !== null && share >= 0 && share <= 100 ? share : null;
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

function chartData(points: IBalancePoint[], locale: string) {
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

const accountDashboardHelpers = Object.freeze({
  periodQuery,
  historyDates,
  toMajorUnits,
  tableRows,
  shareWidth,
  formatPercentage,
  formatDate,
  chartData,
});

export default accountDashboardHelpers;
