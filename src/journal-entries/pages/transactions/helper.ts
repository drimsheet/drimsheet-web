import currencies from '@/shared/configs/currencies.json';
import type {
  IAccountActivityByTypesDto,
  IGetAccountActivityByTypesQuery,
  ILedgerTotalDebitsAndCreditsByCurrencyDto,
} from '@/shared/lib/api/Api';
import { toMajorUnits } from '@/shared/lib/utils/money';
import {
  differenceInCalendarMonths,
  endOfMonth,
  format,
  min,
  startOfMonth,
  subMonths,
} from 'date-fns';
import type { ICurrencyActivity, ITransactionActivityDay } from './types';

function mergeCurrencies(
  revenue: ILedgerTotalDebitsAndCreditsByCurrencyDto,
  expense: ILedgerTotalDebitsAndCreditsByCurrencyDto
): ICurrencyActivity[] {
  const inflows = new Map(
    revenue.totalsByCurrency.map(({ delta }) => [delta.currencyCode, delta])
  );

  const outflows = new Map(
    expense.totalsByCurrency.map(({ delta }) => [delta.currencyCode, delta])
  );

  const codes = [...new Set([...inflows.keys(), ...outflows.keys()])].sort();

  return codes.map((currencyCode) => {
    const inflow = inflows.get(currencyCode);
    const outflow = outflows.get(currencyCode);

    return {
      currencyCode,
      logo: currencies.find(({ code }) => code === currencyCode)?.logo,
      inflow: {
        amount: inflow?.amount ?? 0,
        currencyCode,
        isMinorUnit: inflow?.isMinorUnit ?? false,
      },
      outflow: {
        amount: outflow?.amount ? -outflow.amount : 0,
        currencyCode,
        isMinorUnit: outflow?.isMinorUnit ?? false,
      },
    };
  });
}

function activityQuery(
  date: Date,
  today: Date
): IGetAccountActivityByTypesQuery {
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(min([endOfMonth(date), today]), 'yyyy-MM-dd'),
    bucketDays: 1,
    types: ['revenue', 'expense'],
  };
}

function activityDays(
  data: IAccountActivityByTypesDto
): ITransactionActivityDay[] {
  return data.buckets.map((bucket) => {
    const zero = {
      amount: 0,
      currencyCode: data.currencyCode,
      isMinorUnit: false,
    };

    const inflow =
      bucket.activity.find(({ type }) => type === 'revenue')?.delta ?? zero;

    const outflow =
      bucket.activity.find(({ type }) => type === 'expense')?.delta ?? zero;

    return {
      date: bucket.from,
      in: inflow,
      out: outflow,
      revenue: toMajorUnits(inflow),
      expense: toMajorUnits(outflow),
    };
  });
}

function activityMonths(date: Date, today: Date) {
  const count = Math.max(12, differenceInCalendarMonths(today, date) + 1);

  return Array.from({ length: count }, (_, index) =>
    subMonths(startOfMonth(today), index)
  );
}

const transactionsHelpers = Object.freeze({
  activityMonths,
  mergeCurrencies,
  activityQuery,
  activityDays,
});

export default transactionsHelpers;
