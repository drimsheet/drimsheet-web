import currencies from '@/shared/configs/currencies.json';
import type {
  IAccountActivityDto,
  IAccountBalanceContributionsByCounterpartyDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import {
  eachMonthOfInterval,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns';

function majorUnits(money: IMoneyDto) {
  if (!money.isMinorUnit) {
    return money.amount;
  }

  const currency = currencies.find(
    (row) => row.code.toUpperCase() === money.currencyCode.toUpperCase()
  );

  return money.amount / 10 ** (currency?.minorUnit ?? 0);
}

function period(now: Date, value: string) {
  let end = now;
  let start = subMonths(startOfMonth(now), Number(value) - 1);
  if (value === 'year') {
    start = startOfYear(now);
  }

  if (value === 'previous') {
    const previous = new Date(now.getFullYear() - 1, 0, 1);
    start = startOfYear(previous);
    end = endOfYear(previous);
  }

  return {
    from: format(start, 'yyyy-MM-dd'),
    to: format(end, 'yyyy-MM-dd'),
    months:
      (end.getFullYear() - start.getFullYear()) * 12 +
      end.getMonth() -
      start.getMonth() +
      1,
    end,
  };
}

function participationId(row: IAccountBalanceContributionsByCounterpartyDto) {
  return row.counterparty?.id ?? (row.isSelf ? 'self' : 'unassigned');
}

function recentQuery(
  accountId: string,
  from: string,
  to: string,
  counterpartyId?: string | null
) {
  return {
    accountId,
    effectiveDateFrom: from,
    effectiveDateTo: to,
    page: 1,
    limit: 10,
    orderBy: 'effectiveDate',
    sortDirection: 'desc',
    status: 'posted',
    ...(counterpartyId &&
    counterpartyId !== 'self' &&
    counterpartyId !== 'unassigned'
      ? { counterpartyId }
      : {}),
  } as const;
}

function fromActivity(report: IAccountActivityDto) {
  const months = eachMonthOfInterval({
    start: parseISO(report.period.from),
    end: parseISO(report.period.to),
  }).map((date) => ({ month: format(date, 'yyyy-MM'), amount: 0 }));

  let hasActivity = false;
  for (const bucket of report.buckets) {
    if (bucket.delta.currencyCode !== report.currencyCode) {
      throw new Error('Activity currency mismatch');
    }

    const month = months.find((row) => row.month === bucket.from.slice(0, 7));
    if (month) {
      month.amount += majorUnits(bucket.delta);
    }

    if (bucket.totalDebits.amount !== 0 || bucket.totalCredits.amount !== 0) {
      hasActivity = true;
    }
  }

  return {
    months,
    hasActivity,
    balance: {
      amount: months.reduce((sum, month) => sum + month.amount, 0),
      currencyCode: report.currencyCode,
      isMinorUnit: false,
    },
  };
}

const categoryDetailsHelpers = Object.freeze({
  period,
  participationId,
  recentQuery,
  fromActivity,
});

export default categoryDetailsHelpers;
