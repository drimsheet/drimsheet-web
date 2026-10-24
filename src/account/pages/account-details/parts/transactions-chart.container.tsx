import { useAccountCashFlow } from '@/account/hooks/use-account-cash-flow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import accountDetailsHelpers from '../helper';
import type { AccountSectionProps } from '../types';
import { CashFlowPeriod } from './cash-flow-period';
import { SectionError } from './section-error';
import {
  TransactionsChart,
  TransactionsChartSkeleton,
} from './transactions-chart';
import {
  TransactionsChartRange,
  TransactionsChartRangeSkeleton,
} from './transactions-chart-range';

export function TransactionsChartContainer({
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

  const title = t('details_cash_flow_title');

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        {flow.isPending && <TransactionsChartRangeSkeleton />}
        {flow.isSuccess && (
          <TransactionsChartRange
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
      {flow.isPending && <TransactionsChartSkeleton />}
      {flow.isError && <SectionError title={title} />}
      {flow.isSuccess && <TransactionsChart cashFlow={flow.data} />}
    </div>
  );
}
