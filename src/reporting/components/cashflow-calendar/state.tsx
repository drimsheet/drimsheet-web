import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { cn } from '@/shared/lib/utils/cn';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CashflowCalendar } from './cashflow-calendar';
import cashflowCalendarHelpers from './helper';
import { CalendarFrame } from './parts/calendar-frame';
import type {
  CashflowCalendarErrorProps,
  CashflowCalendarSkeletonProps,
  CashflowCalendarWithStateProps,
} from './types';

export function CashflowCalendarError({
  date,
  variant = 'month',
  ...props
}: Readonly<CashflowCalendarErrorProps>) {
  const { t } = useTranslation('shared');
  const weekCount = cashflowCalendarHelpers.weeks(date, variant).length;
  const minHeight = `${weekCount * 6}rem`;
  const error_text = t('an_error_occurred');

  return (
    <CalendarFrame {...props} date={date} variant={variant}>
      <tr>
        <td colSpan={7} className="p-0">
          <div
            role="alert"
            className="flex min-w-80 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-destructive"
            style={{ minHeight }}
          >
            <TriangleAlert aria-hidden="true" className="size-8 shrink-0" />
            <p>{error_text}</p>
          </div>
        </td>
      </tr>
    </CalendarFrame>
  );
}

export function CashflowCalendarSkeleton({
  date,
  variant = 'month',
  'aria-label': loadingLabel,
}: Readonly<CashflowCalendarSkeletonProps>) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';
  const weeks = cashflowCalendarHelpers.weeks(date, variant);
  const title = cashflowCalendarHelpers.title(date, variant, locale);
  const weekdays = cashflowCalendarHelpers.weeks(date, 'week')[0];
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  return (
    <div
      aria-busy="true"
      className="@container flex w-full min-w-0 flex-col gap-4"
    >
      <output className="sr-only">{loadingLabel}</output>
      <div
        aria-hidden="true"
        className={cn(
          'flex h-9 items-center gap-2 text-muted-foreground',
          variant === 'week' && 'justify-end'
        )}
      >
        {variant === 'week' && (
          <span className="mr-auto text-lg font-medium">{title}</span>
        )}
        <span className="flex size-9 shrink-0 items-center justify-center">
          <ChevronLeft className="size-4" />
        </span>
        {variant === 'month' && (
          <span className="flex-1 text-center text-lg font-medium">
            {title}
          </span>
        )}
        <span className="flex size-9 shrink-0 items-center justify-center">
          <ChevronRight className="size-4" />
        </span>
      </div>
      <div className="overflow-x-auto" aria-hidden="true">
        <div className="min-w-80">
          <div className="grid grid-cols-7 pb-3 text-center text-sm font-medium text-muted-foreground">
            {weekdays.map(
              (day) =>
                day && (
                  <span key={day.getDay()}>{weekdayFormat.format(day)}</span>
                )
            )}
          </div>
          {weeks.map((week, index) => (
            <div key={index} className="grid grid-cols-7">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="flex h-24 flex-col items-center px-0.5 pb-3"
                >
                  {day && (
                    <>
                      <span className="flex size-8 items-center justify-center text-base text-muted-foreground">
                        {day.getDate()}
                      </span>
                      <div className="flex h-5 items-center">
                        <Skeleton className="h-2.5 w-9 rounded-sm" />
                      </div>
                      <div className="flex h-5 items-center">
                        <Skeleton className="h-2.5 w-7 rounded-sm" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CashflowCalendarWithState({
  state = 'success',
  days,
  loadingLabel,
  ...props
}: Readonly<CashflowCalendarWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ days }}
      loading={
        <CashflowCalendarSkeleton
          date={props.date}
          variant={props.variant}
          aria-label={loadingLabel}
        />
      }
      error={<CashflowCalendarError {...props} />}
    >
      {({ days }) => {
        if (days == null) {
          return <CashflowCalendarError {...props} />;
        }

        return <CashflowCalendar {...props} days={days} />;
      }}
    </WithTransitionState>
  );
}
