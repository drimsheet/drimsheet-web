function formatPercentage(value: number | null, locale: string) {
  if (value === null) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function growthDirection(change: number) {
  if (change === 0) return 'neutral';

  if (change < 0) return 'down';

  return 'up';
}

const totalBalanceHelpers = Object.freeze({
  formatPercentage,
  growthDirection,
});

export default totalBalanceHelpers;
