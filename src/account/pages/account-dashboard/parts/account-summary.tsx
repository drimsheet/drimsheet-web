import {
  BalancesByCurrency,
  BalancesByCurrencySkeleton,
} from '@/reporting/components/balances-by-currency';
import {
  TotalBalance,
  TotalBalanceSkeleton,
} from '@/reporting/components/total-balance';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type {
  AccountsSummaryProps,
  AccountsSummaryWithStateProps,
} from '../types';
import { DashboardError } from './section-error';

export function AccountsSummary({
  summary,
  change,
}: Readonly<AccountsSummaryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const balance_label = t('dashboard_balance_label');
  const functional_balance_label = t('dashboard_functional_balance_label');

  const comparison_label = change
    ? t('dashboard_comparison_label', {
        date: dashboardHelpers.formatDate(change.date, locale),
      })
    : undefined;

  const currency_balances_title = t('dashboard_currency_balances_title');

  return (
    <div className="grid min-w-0 items-stretch gap-6 lg:h-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-8">
      <TotalBalance
        balance={summary.totalFunctionalBalance}
        isConverted
        change={change}
        label={balance_label}
        balanceLabel={functional_balance_label}
        comparisonLabel={comparison_label}
      />
      <section
        aria-label={currency_balances_title}
        className="flex min-h-0 min-w-0 flex-col gap-3 lg:border-l lg:pl-8"
      >
        <h3 className="m-0 text-sm font-normal text-muted-foreground">
          {currency_balances_title}
        </h3>
        <dl
          className="flex min-h-0 min-w-0 flex-wrap content-start gap-x-10 gap-y-4 overflow-y-auto overscroll-contain pr-3 [scrollbar-gutter:stable] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-ring lg:flex-1"
          tabIndex={0}
        >
          <BalancesByCurrency balances={summary.balancesByCurrency} />
        </dl>
      </section>
    </div>
  );
}

export function AccountsSummaryWithState({
  state = 'success',
  summary,
  change,
}: Readonly<AccountsSummaryWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ summary, change }}
      loading={<AccountsSummarySkeleton />}
      error={<AccountsSummaryError />}
    >
      {(data) => {
        if (data.summary == null) return <AccountsSummaryError />;

        return <AccountsSummary summary={data.summary} change={data.change} />;
      }}
    </WithTransitionState>
  );
}

export function AccountsSummaryError() {
  const { t } = useTranslation('ledger-accounts');
  const title = t('dashboard_summary_error_title');

  return (
    <div className="min-w-0 lg:min-h-32">
      <DashboardError title={title} />
    </div>
  );
}

export function AccountsSummarySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('dashboard_loading_summary');

  return (
    <div
      aria-busy="true"
      className="grid min-w-0 items-stretch gap-6 lg:h-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-8"
    >
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <TotalBalanceSkeleton />
      <div className="flex min-w-0 flex-col gap-3 lg:border-l lg:pl-8">
        <Skeleton className="h-4 w-36" />
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <BalancesByCurrencySkeleton />
        </dl>
      </div>
    </div>
  );
}
