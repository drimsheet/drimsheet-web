import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import accountDetailsHelpers from '../helper';
import { useAccountCashFlow } from '../hooks/use-account-cash-flow';
import type { AccountSectionProps } from '../types';
import { CashFlowPeriod } from './cash-flow-period';
import { SectionError } from './section-error';
import { TransactionsChart } from './transactions-chart';
import { TransactionsChartSkeleton } from './transactions-chart-skeleton';

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
    <section aria-label={title} className="flex min-w-0 flex-col gap-3">
      <CashFlowPeriod
        period={period}
        periods={periods}
        onPeriodChange={setPeriod}
      />
      {flow.isPending && <TransactionsChartSkeleton />}
      {flow.isError && (
        <SectionError title={title} onRetry={() => void flow.refetch()} />
      )}
      {flow.isSuccess && <TransactionsChart cashFlow={flow.data} />}
    </section>
  );
}
