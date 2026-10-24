import { CurrencyLogo } from '@/shared/components/currency-logo';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { cn } from '@/shared/lib/utils/cn';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type { AccountsSummaryProps } from '../types';

const growthIcons = {
  down: ArrowDownRight,
  neutral: Minus,
  up: ArrowUpRight,
};

const growthClassNames = {
  down: 'text-destructive',
  neutral: 'text-foreground',
  up: 'text-success',
};

export function AccountsSummary({
  summary,
  change,
}: Readonly<AccountsSummaryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const growthDirection = change
    ? dashboardHelpers.growthDirection(
        dashboardHelpers.toMajorUnits(change.amount)
      )
    : undefined;

  const GrowthIcon = growthDirection ? growthIcons[growthDirection] : undefined;

  const balance_label = t('dashboard_balance_label');
  const functional_balance_label = t('dashboard_functional_balance_label');
  const currency_balances_title = t('dashboard_currency_balances_title');

  const comparison_label = change
    ? t('dashboard_comparison_label', {
        date: dashboardHelpers.formatDate(change.date, locale),
      })
    : '';

  return (
    <div className="grid min-w-0 items-stretch gap-6 lg:h-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-8">
      <dl className="m-0 flex min-w-0 flex-col gap-2">
        <dt className="text-sm text-muted-foreground">{balance_label}</dt>
        <dd className="m-0 flex min-w-0 items-baseline text-3xl font-medium tracking-tight tabular-nums">
          <span className="sr-only">{functional_balance_label}</span>
          <span aria-hidden>≈</span>
          <Money
            value={summary.totalFunctionalBalance}
            className="min-w-0 wrap-anywhere"
          />
        </dd>
        {change && GrowthIcon && (
          <dd
            className={cn(
              'm-0 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs',
              growthDirection && growthClassNames[growthDirection]
            )}
          >
            <GrowthIcon className="size-4" aria-hidden />
            <Money value={change.amount} />
            {change.percentageChange !== null && (
              <span>
                (
                {dashboardHelpers.formatPercentage(
                  change.percentageChange,
                  locale
                )}
                )
              </span>
            )}
            <span className="text-muted-foreground">{comparison_label}</span>
          </dd>
        )}
      </dl>
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
          {summary.balancesByCurrency.map((balance) => (
            <div
              key={balance.currencyCode}
              className="flex w-fit flex-none flex-col items-start gap-1"
            >
              <dt>
                <span className="sr-only">{balance.currencyCode}</span>
                <CurrencyLogo
                  aria-hidden
                  url={dashboardHelpers.currencyLogo(balance.currencyCode)}
                  className="size-5"
                />
              </dt>
              <dd className="m-0 whitespace-nowrap text-base font-medium tabular-nums">
                <Money value={balance} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
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
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full max-w-64" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex min-w-0 flex-col gap-3 lg:border-l lg:pl-8">
        <Skeleton className="h-4 w-36" />
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex flex-col gap-1">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
