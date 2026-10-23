import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { cn } from '@/shared/lib/utils/cn';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type { AccountsSummaryProps } from '../types';

export function AccountsSummary({ summary }: Readonly<AccountsSummaryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const change = dashboardHelpers.toMajorUnits(summary.netAssets.change);
  const GrowthIcon = change < 0 ? ArrowDownRight : ArrowUpRight;
  const balance_label = t('dashboard_balance_label');
  const assets_label = t('dashboard_assets_total_label');
  const liabilities_label = t('dashboard_liabilities_total_label');

  const comparison_label = t('dashboard_comparison_label', {
    date: dashboardHelpers.formatDate(summary.comparisonPeriod.to, locale),
  });

  const unavailable_label = t('dashboard_percentage_unavailable');

  return (
    <dl className="grid min-w-0 grid-cols-2 items-start gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div className="col-span-2 lg:col-span-1">
        <dt className="text-sm text-muted-foreground">{balance_label}</dt>
        <dd className="my-2 text-3xl font-medium tracking-tight tabular-nums">
          <Money value={summary.netAssets.total} />
        </dd>
        <dd className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs">
          {change !== 0 && <GrowthIcon className="size-4" aria-hidden />}
          {change === 0 && <Minus className="size-4" aria-hidden />}
          <Money value={summary.netAssets.change} />
          {summary.netAssets.percentageChange !== null && (
            <span>
              (
              {dashboardHelpers.formatPercentage(
                summary.netAssets.percentageChange,
                locale
              )}
              )
            </span>
          )}
          <span className="text-muted-foreground">{comparison_label}</span>
          {summary.netAssets.percentageChange === null && (
            <span className="text-muted-foreground">{unavailable_label}</span>
          )}
        </dd>
      </div>
      {[
        {
          label: assets_label,
          value: summary.assets.total,
          color: 'bg-primary',
        },
        {
          label: liabilities_label,
          value: summary.liabilities.total,
          color: 'bg-secondary',
        },
      ].map(({ label, value, color }) => (
        <div key={label} className="min-w-0 lg:border-l lg:pl-5">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className={cn('size-2 shrink-0 rounded-sm', color)}
            />
            {label}
          </dt>
          <dd className="mt-2 break-words text-xl tracking-tight tabular-nums sm:text-2xl">
            <Money value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AccountsSummarySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('dashboard_loading_summary');

  return (
    <div
      aria-busy="true"
      className="grid min-w-0 grid-cols-2 items-start gap-6 lg:grid-cols-[1.4fr_1fr_1fr]"
    >
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="col-span-2 flex min-w-0 flex-col gap-2 lg:col-span-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="my-2 h-9 w-full max-w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      {[0, 1].map((item) => (
        <div key={item} className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="my-2 h-7 w-full max-w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
