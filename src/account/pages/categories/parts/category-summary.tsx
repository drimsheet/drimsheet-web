import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { ArrowDownLeft, ArrowUpRight, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CategorySummaryProps } from '../types';

export function CategorySummary({ summary }: Readonly<CategorySummaryProps>) {
  const { t } = useTranslation('ledger-accounts');

  const cards = [
    {
      title: t('categories_revenue_label'),
      icon: ArrowUpRight,
      color: 'text-financial-income',
      amount: summary.revenue,
    },
    {
      title: t('categories_total_expenses_label'),
      icon: ArrowDownLeft,
      color: 'text-financial-expense',
      amount: summary.expenses,
    },
    {
      title: t('categories_uncategorized_label'),
      icon: Tags,
      color: 'text-muted-foreground',
      amount: summary.uncategorized,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-2 gap-y-6 md:grid-cols-3">
      {cards.map(({ title, icon: Icon, color, amount }) => (
        <section
          key={title}
          aria-label={title}
          className="flex min-w-0 flex-col gap-3 px-4 first:border-r first:border-border first:pl-0 last:col-span-2 last:border-t last:border-border last:px-0 last:pt-5 md:px-5 md:last:col-span-1 md:last:border-t-0 md:last:border-l md:last:pl-5 md:last:pt-0"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon aria-hidden className={`size-4 ${color}`} />
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <Money
            value={amount}
            className="text-2xl font-medium tracking-tight tabular-nums break-all md:text-3xl"
          />
        </section>
      ))}
    </div>
  );
}

export function CategorySummarySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('categories_loading_label');

  return (
    <div
      aria-busy="true"
      className="grid min-w-0 grid-cols-2 gap-y-6 md:grid-cols-3"
    >
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex min-w-0 flex-col gap-3 px-4 first-of-type:border-r first-of-type:border-border first-of-type:pl-0 last:col-span-2 last:border-t last:border-border last:px-0 last:pt-5 md:px-5 md:last:col-span-1 md:last:border-t-0 md:last:border-l md:last:pl-5 md:last:pt-0"
        >
          <Skeleton className="h-5 w-full max-w-28" />
          <Skeleton className="h-8 w-full max-w-40 md:h-9" />
        </div>
      ))}
    </div>
  );
}
