import { Money } from '@/shared/components/money';
import { cn } from '@/shared/lib/utils/cn';
import { isAfter, isSameDay } from 'date-fns';
import cashflowCalendarHelpers from '../helper';
import type { CashflowDayProps } from '../types';

export function CashflowDay({
  date,
  today,
  color,
  entry,
  labels,
  locale,
}: Readonly<CashflowDayProps>) {
  const key = cashflowCalendarHelpers.dateKey(date);
  const isToday = isSameDay(date, today);

  const dateLabel = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
  }).format(date);

  return (
    <td className="h-18 px-0.5 pb-2 align-top" aria-label={dateLabel}>
      <time
        dateTime={key}
        aria-current={isToday ? 'date' : undefined}
        className={cn(
          'mx-auto flex size-7 items-center justify-center rounded-full text-base',
          isAfter(date, today) && 'text-muted-foreground',
          isToday &&
            color === 'primary' &&
            'bg-primary text-primary-foreground',
          isToday &&
            color === 'secondary' &&
            'bg-secondary text-secondary-foreground'
        )}
      >
        {date.getDate()}
      </time>
      {entry && (
        <div className="flex flex-col text-xs font-medium tabular-nums">
          <span className="h-4 whitespace-nowrap text-financial-income">
            {entry.in.amount !== 0 && (
              <>
                <span aria-hidden>
                  <Money
                    value={entry.in}
                    notation="compact"
                    signDisplay="exceptZero"
                    currencyDisplay="narrowSymbol"
                    maximumFractionDigits={1}
                  />
                </span>
                <span className="sr-only">
                  {labels.inflowLabel}: <Money value={entry.in} />
                </span>
              </>
            )}
          </span>
          <span className="h-4 whitespace-nowrap text-financial-expense">
            {entry.out.amount !== 0 && (
              <>
                <span aria-hidden>
                  <Money
                    value={{
                      amount: -entry.out.amount,
                      currencyCode: entry.out.currencyCode,
                      isMinorUnit: entry.out.isMinorUnit,
                    }}
                    notation="compact"
                    signDisplay="exceptZero"
                    currencyDisplay="narrowSymbol"
                    maximumFractionDigits={1}
                  />
                </span>
                <span className="sr-only">
                  {labels.outflowLabel}: <Money value={entry.out} />
                </span>
              </>
            )}
          </span>
        </div>
      )}
    </td>
  );
}
