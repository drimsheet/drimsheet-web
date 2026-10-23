import countries from '@/shared/configs/countries.json';
import currencies from '@/shared/configs/currencies.json';
import type {
  IAccountingInterval,
  IFiscalYear,
  IReportingInterval,
} from '@/shared/lib/api/Api';

function formatDate(value: string, locale: string, exclusiveEnd = false) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '—';

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(timestamp - (exclusiveEnd ? 1 : 0)));
}

function selectFiscalYear(
  years: IFiscalYear[],
  selectedId: string | undefined,
  now: number
) {
  const selected = years.find((year) => year.id === selectedId);
  if (selected) return selected;

  const sorted = [...years].sort(
    (a, b) => Date.parse(b.startDate) - Date.parse(a.startDate)
  );

  return (
    sorted.find(
      (year) =>
        Date.parse(year.startDate) <= now &&
        now < Date.parse(year.endDate.slice(0, 10)) + 86_400_000
    ) ?? sorted[0]
  );
}

function currentPeriod<T extends IAccountingInterval | IReportingInterval>(
  interval: T,
  now: number
): T['periods'][number] | undefined {
  return interval.periods.find(
    (period) =>
      period.ordinal === interval.currentPeriodOrdinal &&
      Date.parse(period.startDate) <= now &&
      now < Date.parse(period.endDate)
  );
}

function currency(code: string) {
  const item = currencies.find((value) => value.code === code);

  const countryCode = item?.logo
    ?.match(/\/([a-z]{2})\.png$/i)?.[1]
    ?.toUpperCase();

  const flag = countryCode
    ? String.fromCodePoint(
        ...[...countryCode].map((letter) => letter.charCodeAt(0) + 127397)
      )
    : '';

  return { name: item?.name ?? code, flag };
}

function jurisdiction(code: string) {
  const country = countries.find((value) => value.code === code);

  return { name: country?.name ?? code, flag: country?.flag ?? '' };
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toLocaleUpperCase();
}

const legalEntityDetailsHelpers = Object.freeze({
  formatDate,
  selectFiscalYear,
  currentPeriod,
  currency,
  jurisdiction,
  initials,
});

export default legalEntityDetailsHelpers;
