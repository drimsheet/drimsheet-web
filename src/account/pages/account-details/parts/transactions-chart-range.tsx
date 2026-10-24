import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import accountDetailsHelpers from '../helper';
import type { TransactionsChartRangeProps } from '../types';

export function TransactionsChartRange({
  period,
  currencyCode,
}: Readonly<TransactionsChartRangeProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');

  const locale =
    i18n.resolvedLanguage === 'en' ? 'en-GB' : i18n.resolvedLanguage;

  const range_text = t('details_chart_range_text', {
    from: accountDetailsHelpers.formatDate(period.from, locale),
    to: accountDetailsHelpers.formatDate(period.to, locale),
    currency: currencyCode,
  });

  return <p className="text-sm text-muted-foreground">{range_text}</p>;
}

export function TransactionsChartRangeSkeleton() {
  return <Skeleton className="h-4 w-48" />;
}
