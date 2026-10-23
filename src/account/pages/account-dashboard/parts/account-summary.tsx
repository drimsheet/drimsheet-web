import { Money } from '@/shared/components/money';
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
