import { AccountCashFlowChartWithState } from '@/reporting/components/account-cash-flow-chart';
import {
  ReportingIntervalSelect,
  ReportingIntervalSelectSkeleton,
} from '@/reporting/components/reporting-interval-select';
import { useAccountCashFlow } from '@/reporting/hooks/use-account-cash-flow';
import { useReportingInterval } from '@/reporting/hooks/use-reporting-interval';
import { useTranslation } from 'react-i18next';
import type { AccountSectionProps } from '../types';
import {
  AccountCashFlowChartRange,
  AccountCashFlowChartRangeSkeleton,
} from './account-cash-flow-chart-range';

export function AccountCashFlowChartContainer({
  accountId,
}: Readonly<AccountSectionProps>) {
  const { t } = useTranslation('ledger-accounts');
  const reporting = useReportingInterval(!!accountId);
  const range = reporting.range;

  const flow = useAccountCashFlow(
    accountId,
    {
      from: range?.from ?? '',
      to: range?.to ?? '',
      bucketDays: reporting.bucketDays,
    },
    !!range
  );

  const labels = {
    loadingLabel: t('details_loading_transactions_chart'),
    errorTitle: t('details_cash_flow_title'),
    errorDescription: reporting.isRangeTooLong
      ? t('reporting_range_too_long_error')
      : t('details_load_error_text'),
    moneyInLabel: t('details_money_in_label'),
    moneyOutLabel: t('details_money_out_label'),
    totalInLabel: t('details_total_in_label'),
    totalOutLabel: t('details_total_out_label'),
    dateLabel: t('details_date_label'),
    chartLabel: t('details_chart_aria_label'),
  };

  const error = reporting.isError || reporting.isRangeTooLong || flow.isError;
  const loading = !error && (reporting.isPending || flow.isPending);
  const state = error ? 'error' : 'success';

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        {loading && <AccountCashFlowChartRangeSkeleton />}
        {flow.isSuccess && flow.data && (
          <AccountCashFlowChartRange
            period={flow.data.period}
            currencyCode={flow.data.currencyCode}
          />
        )}
        <div className="ml-auto w-full sm:w-auto">
          {reporting.isPending && <ReportingIntervalSelectSkeleton />}
          {reporting.interval && !reporting.isPending && (
            <ReportingIntervalSelect
              interval={reporting.interval}
              onChange={reporting.onChange}
            />
          )}
        </div>
      </div>
      <AccountCashFlowChartWithState
        state={loading ? 'loading' : state}
        cashFlow={flow.data}
        labels={labels}
      />
    </div>
  );
}
