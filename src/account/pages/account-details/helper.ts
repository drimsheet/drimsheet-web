import { parseISO } from 'date-fns';

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

const accountDetailsHelpers = Object.freeze({ formatDate });

export default accountDetailsHelpers;
