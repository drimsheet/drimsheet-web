import { Tabs } from '@/shared/components/tabs';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type { BalanceHistoryProps } from '../types';
import { BalanceTrend, BalanceTrendSkeleton } from './balance-trend';
import { DashboardError } from './section-error';

export function BalanceHistory({
  period,
  onPeriodChange,
  history,
  loading,
  error,
}: Readonly<BalanceHistoryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const handlePeriodChange = (value: string) => {
    if (value === '1M' || value === '6M' || value === '1Y')
      onPeriodChange(value);
  };

  const title = t('dashboard_history_title');
  const period_label = t('dashboard_period_label');
  const error_title = t('dashboard_history_error_title');

  const range_text = history
    ? t('dashboard_period_range', {
        from: dashboardHelpers.formatDate(history.period.from, locale),
        to: dashboardHelpers.formatDate(history.period.to, locale),
      })
    : '';

  return (
    <div className="flex min-w-0 flex-col gap-3" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="m-0 text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          {range_text && (
            <p className="mt-1 text-xs text-muted-foreground">{range_text}</p>
          )}
        </div>
        <Tabs
          ariaLabel={period_label}
          value={period}
          onValueChange={handlePeriodChange}
          items={['1M', '6M', '1Y'].map((value) => ({ value, label: value }))}
        />
      </div>
      {loading && <BalanceTrendSkeleton />}
      {!loading && error && <DashboardError title={error_title} />}
      {!loading && !error && <BalanceTrend points={history?.points ?? []} />}
    </div>
  );
}
