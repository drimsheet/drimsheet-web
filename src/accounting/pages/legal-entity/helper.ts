function formatDate(
  value: string | undefined,
  locale: string,
  fallback: string
) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  // Fiscal boundaries are calendar dates; the viewer's timezone must not shift them.
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

const legalEntityHelpers = Object.freeze({ formatDate });

export default legalEntityHelpers;
