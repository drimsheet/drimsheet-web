import currencies from '@/shared/configs/currencies.json';
import type {
  IAccountActivityDto,
  IAccountBalanceContributionsByCounterpartyDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import { eachMonthOfInterval, format, parseISO } from 'date-fns';

function majorUnits(money: IMoneyDto) {
  if (!money.isMinorUnit) {
    return money.amount;
  }

  const currency = currencies.find(
    (row) => row.code.toUpperCase() === money.currencyCode.toUpperCase()
  );

  return money.amount / 10 ** (currency?.minorUnit ?? 0);
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
  participationId,
  recentQuery,
  fromActivity,
});

export default categoryDetailsHelpers;
