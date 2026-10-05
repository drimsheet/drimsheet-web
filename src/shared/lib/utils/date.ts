import countries from '@/shared/configs/countries.json';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

const JS_MONTH_INDEX_OFFSET = 1;
const DEFAULT_LOCALE = 'en-NG';

const formatOptions = Object.freeze({
  monthAndDayOnly: 'MMMM Do',
  monthAndYear: 'MMM YYYY',
  apiDate: 'YYYY-MM-DD',
});

function formatFiscalDate(month: number, day: number) {
  // Use a fixed leap year (2024) to support February 29th
  return dayjs()
    .year(2024)
    .month(month - 1)
    .date(day)
    .format(formatOptions.monthAndDayOnly);
}

function getFiscalYearDateRange(
  month: number,
  day: number
): { startDate: Date; endDate: Date } {
  const currentYear = new Date().getFullYear();

  const isLeapYear =
    (currentYear % 4 === 0 && currentYear % 100 !== 0) ||
    currentYear % 400 === 0;

  const actualDay = month === 2 && day === 29 && !isLeapYear ? 28 : day;
  const startDate = new Date(currentYear, month - 1, actualDay);
  const endDate = dayjs(startDate).add(1, 'year').subtract(1, 'day').toDate();

  return { startDate, endDate };
}

function formatFiscalDateWithYear(date: Date) {
  return dayjs(date).format(formatOptions.monthAndYear);
}

function formatDateForApi(date: Date | string | number): string {
  return dayjs(date).format(formatOptions.apiDate);
}

function formatWithJurisdiction(date: Date, countryCode?: string): string {
  let locale = DEFAULT_LOCALE;
  if (countryCode) {
    const country = countries.find((c) => c.code === countryCode);
    if (country?.locale) {
      locale = country.locale;
    }
  }

  if (!dayjs(date).isValid()) {
    return 'Invalid Date';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
      .format(date)
      .replace(/,/g, '');
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
      .format(date)
      .replace(/,/g, '');
  }
}

function shiftDateByDistance(
  newStart: Date,
  oldStart: Date,
  oldEnd: Date
): Date {
  const oldStartD = dayjs(oldStart);
  const oldEndD = dayjs(oldEnd);
  const newStartD = dayjs(newStart);

  const monthsDiff = oldEndD.diff(oldStartD, 'month');
  const oldStartPlusMonths = oldStartD.add(monthsDiff, 'month');
  const daysDiff = oldEndD.diff(oldStartPlusMonths, 'day');

  return newStartD.add(monthsDiff, 'month').add(daysDiff, 'day').toDate();
}

function isValidFiscalYearDuration(start: Date, end: Date): boolean {
  const startD = dayjs(start);
  const endD = dayjs(end);

  const oneMonthLater = startD.add(1, 'month').subtract(1, 'day');
  const twentyThreeMonthsLater = startD.add(23, 'month');

  return (
    !endD.isBefore(oneMonthLater, 'day') &&
    !endD.isAfter(twentyThreeMonthsLater, 'day')
  );
}

function getDurationInMonths(start: Date, end: Date): number {
  return Math.round(dayjs(end).add(1, 'day').diff(dayjs(start), 'month', true));
}

function isValidDate(date: Date | string | number) {
  return dayjs(date).isValid();
}

function isNotInThePast(date: Date | string | number) {
  return dayjs(date).isAfter(dayjs());
}

function isNotInTheFuture(date: Date | string | number) {
  return dayjs(date).isBefore(dayjs());
}

function isOnOrAfter(
  date: Date | string | number,
  earliestDate: Date | string | number
) {
  const candidateDate = dayjs(date);
  const boundaryDate = dayjs(earliestDate);

  return (
    candidateDate.isValid() &&
    boundaryDate.isValid() &&
    !candidateDate.isBefore(boundaryDate, 'day')
  );
}

export const dateUtils = Object.freeze({
  isValidDate,
  isNotInThePast,
  isNotInTheFuture,
  isOnOrAfter,
  formatFiscalDate,
  getFiscalYearDateRange,
  formatFiscalDateWithYear,
  formatDateForApi,
  formatWithJurisdiction,
  shiftDateByDistance,
  isValidFiscalYearDuration,
  getDurationInMonths,
  formatOptions,
});

export { JS_MONTH_INDEX_OFFSET };
