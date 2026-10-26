import { useTranslation } from 'react-i18next';
import cashflowCalendarHelpers from './helper';
import { CalendarFrame } from './parts/calendar-frame';
import { CashflowDay } from './parts/cashflow-day';
import type { CashflowCalendarProps } from './types';

export function CashflowCalendar({
  days,
  date,
  today,
  variant = 'month',
  color = 'primary',
  labels,
  onDateChange,
}: Readonly<CashflowCalendarProps>) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';
  const weeks = cashflowCalendarHelpers.weeks(date, variant);
  const entries = new Map(days.map((day) => [day.date, day]));

  return (
    <CalendarFrame
      date={date}
      today={today}
      variant={variant}
      labels={labels}
      onDateChange={onDateChange}
    >
      {weeks.map((week, index) => (
        <tr key={index}>
          {week.map((day, dayIndex) => {
            if (!day) {
              return <td key={dayIndex} />;
            }

            const key = cashflowCalendarHelpers.dateKey(day);

            return (
              <CashflowDay
                key={key}
                date={day}
                today={today}
                color={color}
                entry={entries.get(key)}
                labels={labels}
                locale={locale}
              />
            );
          })}
        </tr>
      ))}
    </CalendarFrame>
  );
}
