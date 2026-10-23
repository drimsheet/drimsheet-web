import { Tabs } from '@/shared/components/tabs';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import { useBalanceSnapshots } from '../hooks/use-balance-snapshots';
import type { BalanceHistoryContainerProps, IBalancePoint } from '../types';
import { BalanceTrend } from './balance-trend';
import { DashboardError } from './section-error';
import { DashboardSkeleton } from './skeleton';

export function BalanceHistoryContainer({
  period,
  onPeriodChange,
  summary,
  enabled,
  summaryError,
}: Readonly<BalanceHistoryContainerProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const dates = summary ? dashboardHelpers.historyDates(summary.period) : [];
  const snapshots = useBalanceSnapshots(dates, enabled && !!summary);
  const loading = !summary || snapshots.some((query) => query.isPending);
  const failed = snapshots.some((query) => query.isError);
  const points: IBalancePoint[] = [];

  if (summary && !loading && !failed) {
    points.push({
      date: summary.comparisonPeriod.to,
      amount: summary.netAssets.previousTotal,
    });
    snapshots.forEach((query, index) => {
      if (query.data)
        points.push({ date: dates[index], amount: query.data.netAssets.total });
    });
    points.push({ date: summary.period.to, amount: summary.netAssets.total });
  }

  const handlePeriodChange = (value: string) => {
    if (value === '1M' || value === '6M' || value === '1Y')
      onPeriodChange(value);
  };

  const handleRetry = () => {
    snapshots
      .filter((query) => query.isError)
      .forEach((query) => void query.refetch());
  };

  const title = t('dashboard_history_title');
  const period_label = t('dashboard_period_label');
  const error_title = t('dashboard_history_error_title');

  const range_text = summary
    ? t('dashboard_period_range', {
        from: dashboardHelpers.formatDate(summary.comparisonPeriod.to, locale),
        to: dashboardHelpers.formatDate(summary.period.to, locale),
      })
    : '';

  return (
    <div
      className="flex min-w-0 flex-col gap-3"
      aria-busy={loading && !summaryError}
    >
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
      {!summaryError && loading && <DashboardSkeleton section="history" />}
      {!summaryError && !loading && failed && (
        <DashboardError
          title={error_title}
          onRetry={handleRetry}
          pending={snapshots.some((query) => query.isFetching)}
        />
      )}
      {!summaryError && !loading && !failed && <BalanceTrend points={points} />}
    </div>
  );
}
