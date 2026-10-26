import { BalanceTrendWithState } from '@/reporting/components/balance-trend';
import { Tabs } from '@/shared/components/tabs';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type { BalanceHistoryProps } from '../types';

export function BalanceHistory({
  period,
  onPeriodChange,
  history,
  loading,
  error,
}: Readonly<BalanceHistoryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const settledState = error ? 'error' : 'success';

  const handlePeriodChange = (value: string) => {
    if (value === '1M' || value === '6M' || value === '1Y') {
      onPeriodChange(value);
    }
  };

  const title = t('dashboard_history_title');

  const labels = {
    chartLabel: t('dashboard_history_title'),
    balanceLabel: t('dashboard_balance_label'),
    dateLabel: t('dashboard_date_label'),
    dataLabel: t('dashboard_chart_data_label'),
    emptyTitle: t('dashboard_history_empty_title'),
    inactiveTitle: t('dashboard_activity_empty_title'),
    emptyDescription: t('dashboard_history_empty_description'),
    loadingLabel: t('dashboard_loading_history'),
    errorTitle: t('dashboard_history_error_title'),
    errorDescription: t('dashboard_error_description'),
  };

  const period_label = t('dashboard_period_label');

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
      <BalanceTrendWithState
        labels={labels}
        state={loading ? 'loading' : settledState}
        points={history?.points}
      />
    </div>
  );
}
