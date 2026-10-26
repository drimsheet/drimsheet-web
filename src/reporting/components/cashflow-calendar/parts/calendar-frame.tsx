import { Button } from '@/shared/components/button';
import { cn } from '@/shared/lib/utils/cn';
import { isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cashflowCalendarHelpers from '../helper';
import type { CalendarFrameProps } from '../types';

export function CalendarFrame({
  children,
  date,
  today,
  variant = 'month',
  labels,
  onDateChange,
}: Readonly<CalendarFrameProps>) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';
  const title = cashflowCalendarHelpers.title(date, variant, locale);
  const nextDate = cashflowCalendarHelpers.move(date, variant, 1);

  const nextDisabled = isAfter(
    nextDate,
    cashflowCalendarHelpers.periodStart(today, variant)
  );

  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const weekdays = cashflowCalendarHelpers.weeks(date, 'week')[0];

  function handlePrevious() {
    onDateChange(cashflowCalendarHelpers.move(date, variant, -1));
  }

  function handleNext() {
    onDateChange(nextDate);
  }

  return (
    <section
      aria-label={labels.calendarLabel}
      className="@container flex w-full min-w-0 flex-col gap-4"
    >
      <div
        className={cn(
          'flex items-center gap-2',
          variant === 'week' && 'justify-end'
        )}
      >
        {variant === 'week' && (
          <h3 className="mr-auto text-lg font-medium">{title}</h3>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.previousLabel}
          onClick={handlePrevious}
        >
          <ChevronLeft aria-hidden />
        </Button>
        {variant === 'month' && (
          <h3 className="flex-1 text-center text-lg font-medium">{title}</h3>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.nextLabel}
          disabled={nextDisabled}
          onClick={handleNext}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table
          aria-label={title}
          className="w-full min-w-80 table-fixed border-collapse text-center"
        >
          <thead>
            <tr>
              {weekdays.map(
                (day) =>
                  day && (
                    <th
                      key={day.getDay()}
                      scope="col"
                      className="pb-3 text-sm font-medium text-muted-foreground"
                    >
                      {weekdayFormat.format(day)}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}
