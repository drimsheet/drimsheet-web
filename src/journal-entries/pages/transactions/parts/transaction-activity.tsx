import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import transactionsHelpers from '../helper';
import type { TransactionActivityProps } from '../types';
import { TransactionActivityChartWithState } from './transaction-activity-chart';

export function TransactionActivity({
  date,
  today,
  onDateChange,
  state,
  days,
  currencyCode,
}: Readonly<TransactionActivityProps>) {
  const { t, i18n } = useTranslation('journal-entries');
  const months = transactionsHelpers.activityMonths(date, today);

  const monthFormat = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'en', {
    month: 'long',
    year: 'numeric',
  });

  function handleMonthChange(value: string) {
    onDateChange(parseISO(`${value}-01`));
  }

  const month_label = t('activity_month_label');
  const inflow_label = t('inflow_tab');
  const outflow_label = t('outflow_tab');

  return (
    <div className="flex min-w-0 flex-col gap-6 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 rounded-xs bg-financial-income"
              />
              {inflow_label}
            </span>
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 rounded-xs bg-financial-expense"
              />
              {outflow_label}
            </span>
          </div>
        </div>

        <Select
          value={format(date, 'yyyy-MM')}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger aria-label={month_label} className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {months.map((month) => (
                <SelectItem
                  key={format(month, 'yyyy-MM')}
                  value={format(month, 'yyyy-MM')}
                >
                  {monthFormat.format(month)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <TransactionActivityChartWithState
        key={format(date, 'yyyy-MM')}
        state={state}
        days={days}
        currencyCode={currencyCode}
      />
    </div>
  );
}
