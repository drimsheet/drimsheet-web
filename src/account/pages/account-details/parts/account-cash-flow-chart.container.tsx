import { AccountCashFlowChartWithState } from '@/reporting/components/account-cash-flow-chart';
import { useAccountCashFlow } from '@/reporting/hooks/use-account-cash-flow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import accountDetailsHelpers from '../helper';
import type { AccountSectionProps } from '../types';
import {
  AccountCashFlowChartRange,
  AccountCashFlowChartRangeSkeleton,
} from './account-cash-flow-chart-range';
import { CashFlowPeriod } from './cash-flow-period';

export function AccountCashFlowChartContainer({
  accountId,
}: Readonly<AccountSectionProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const now = new Date();

  const periods = accountDetailsHelpers.periodOptions(
    now,
    i18n.resolvedLanguage ?? 'en-GB'
  );

  const [period, setPeriod] = useState(periods[0].value);

  const flow = useAccountCashFlow(
    accountId,
    accountDetailsHelpers.periodQuery(period, now)
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

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        {flow.isPending && <AccountCashFlowChartRangeSkeleton />}
        {flow.isSuccess && flow.data && (
          <AccountCashFlowChartRange
            period={flow.data.period}
            currencyCode={flow.data.currencyCode}
          />
        )}
        <div className="ml-auto w-full sm:w-auto">
          <CashFlowPeriod
            period={period}
            periods={periods}
            onPeriodChange={setPeriod}
          />
        </div>
      </div>
      <AccountCashFlowChartWithState
        state={flow.isPending ? 'loading' : flow.status}
        cashFlow={flow.data}
        labels={labels}
      />
    </div>
  );
}
