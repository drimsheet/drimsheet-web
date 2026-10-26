import type { IAccountCashFlowDto } from '@/shared/lib/api/Api';
import { toMajorUnits } from '@/shared/lib/utils/money';
import { addDays, parseISO } from 'date-fns';

function formatDate(
  value: string | Date,
  locale = 'en-GB',
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
) {
  const date = typeof value === 'string' ? parseISO(value) : value;

  return new Intl.DateTimeFormat(locale, options).format(date);
}

function chartData(cashFlow: IAccountCashFlowDto, locale: string) {
  const data = cashFlow.buckets.map((bucket) => ({
    label: formatDate(bucket.from, locale, { day: 'numeric', month: 'short' }),
    range: `${formatDate(bucket.from, locale)} – ${formatDate(bucket.to, locale)}`,
    moneyIn: toMajorUnits(bucket.moneyIn),
    moneyOut: toMajorUnits(bucket.moneyOut),
  }));

  if (
    data.length ||
    cashFlow.totalMoneyIn.amount !== 0 ||
    cashFlow.totalMoneyOut.amount !== 0
  )
    return data;

  const end = parseISO(cashFlow.period.to);

  for (
    let from = parseISO(cashFlow.period.from);
    from <= end;
    from = addDays(from, 7)
  ) {
    const bucketEnd = addDays(from, 6);
    const to = bucketEnd > end ? end : bucketEnd;
    data.push({
      label: formatDate(from, locale, { day: 'numeric', month: 'short' }),
      range: `${formatDate(from, locale)} – ${formatDate(to, locale)}`,
      moneyIn: 0,
      moneyOut: 0,
    });
  }

  return data;
}

const accountCashFlowChartHelpers = Object.freeze({ chartData });

export default accountCashFlowChartHelpers;
