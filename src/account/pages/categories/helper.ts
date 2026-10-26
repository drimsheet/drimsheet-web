import currencies from '@/shared/configs/currencies.json';
import type {
  IDateRangeDto,
  IMoneyDto,
  IRevenueExpenseAccountDto,
  IRevenueExpenseSectionDto,
} from '@/shared/lib/api/Api';
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import type { ICategoryTableRow } from './types';

function tableRows(accounts: IRevenueExpenseAccountDto[]): ICategoryTableRow[] {
  return accounts.map((account) => ({ ...account, id: account.accountId }));
}

function periodOptions(now: Date, locale: string) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(startOfMonth(now), index);

    return {
      value: format(date, 'yyyy-MM'),
      label: new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(date),
    };
  });
}

function periodQuery(period: string, now: Date): IDateRangeDto {
  const from = parseISO(`${period}-01`);
  const end = endOfMonth(from);

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(end > now ? now : end, 'yyyy-MM-dd'),
  };
}

function formatPeriod(period: IDateRangeDto, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(parseISO(period.from))} – ${formatter.format(parseISO(period.to))}`;
}

function toMajorUnits(money: IMoneyDto) {
  const currency = currencies.find(
    ({ code }) => code.toLowerCase() === money.currencyCode.toLowerCase()
  );

  return money.isMinorUnit
    ? money.amount / 10 ** (currency?.minorUnit ?? 0)
    : money.amount;
}

function chartRows(accounts: IRevenueExpenseSectionDto['accounts']) {
  const amounts = accounts.map(({ amount }) => toMajorUnits(amount));
  const minimum = Math.min(0, ...amounts);
  const maximum = Math.max(0, ...amounts);
  const range = maximum - minimum || 1;
  const zero = (-minimum / range) * 100;

  return accounts.map((account, index) => ({
    account,
    zero,
    left: ((Math.min(0, amounts[index]) - minimum) / range) * 100,
    width: (Math.abs(amounts[index]) / range) * 100,
    negative: amounts[index] < 0,
  }));
}

function formatPercentage(
  value: number | null,
  locale: string,
  showSign = false
) {
  if (value === null) {
    return '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  }).format(value / 100);
}

const categoriesHelpers = Object.freeze({
  tableRows,
  periodOptions,
  periodQuery,
  formatPeriod,
  toMajorUnits,
  chartRows,
  formatPercentage,
});

export default categoriesHelpers;
