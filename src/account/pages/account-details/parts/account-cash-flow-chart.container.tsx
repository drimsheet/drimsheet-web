import reportRangeUtils from '@/account/lib/utils/report-range';
import { AccountCashFlowChartWithState } from '@/reporting/components/account-cash-flow-chart';
import { ReportingIntervalSelectContainer } from '@/reporting/components/reporting-interval-select';
import { useAccountCashFlow } from '@/reporting/hooks/use-account-cash-flow';
import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { useState } from 'react';
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

  const [range, setRange] = useState<IDateRangeDto>();

  const flow = useAccountCashFlow(
    accountId,
    {
      from: range?.from ?? '',
      to: range?.to ?? '',
      bucketDays: reportRangeUtils.bucketDays(range),
    },
    !!range
  );

  const labels = {
    loadingLabel: t('details_loading_transactions_chart'),
    errorTitle: t('details_cash_flow_title'),
    errorDescription: t('details_load_error_text'),
    moneyInLabel: t('details_money_in_label'),
    moneyOutLabel: t('details_money_out_label'),
    totalInLabel: t('details_total_in_label'),
    totalOutLabel: t('details_total_out_label'),
    dateLabel: t('details_date_label'),
    chartLabel: t('details_chart_aria_label'),
  };

  const loading = !!range && flow.isPending;
  const state = flow.isError ? 'error' : 'success';

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        {loading && <AccountCashFlowChartRangeSkeleton />}
        {range && flow.isSuccess && flow.data && (
          <AccountCashFlowChartRange
            period={flow.data.period}
            currencyCode={flow.data.currencyCode}
          />
        )}
        <div className="ml-auto w-full sm:w-auto">
          <ReportingIntervalSelectContainer onChange={setRange} />
        </div>
      </div>
      {range && (
        <AccountCashFlowChartWithState
          state={loading ? 'loading' : state}
          cashFlow={flow.data}
          labels={labels}
        />
      )}
    </div>
  );
}
