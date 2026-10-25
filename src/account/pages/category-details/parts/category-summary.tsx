import { AppSection } from '@/shared/components/app-section';
import { Badge } from '@/shared/components/badge';
import { Money } from '@/shared/components/money';
import { PageTitle } from '@/shared/components/page-title';
import { Separator } from '@/shared/components/separator';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { CategorySummaryProps } from '../types';
import {
  CategoryTransactionCount,
  CategoryTransactionCountSkeleton,
} from './category-transaction-count';

export function CategorySummary({
  account,
  transactionCount,
  actions,
}: Readonly<CategorySummaryProps>) {
  const { t } = useTranslation('ledger-accounts');

  const type_label = t(
    account.type === 'revenue'
      ? 'categories_type_revenue'
      : 'categories_type_expense'
  );

  const status_label = t(`categories_status_${account.status}`);

  const balance_label = t('category_details_balance_label');

  return (
    <div className="flex min-w-0 flex-col" aria-label={account.name}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{type_label}</Badge>
            <Badge variant="secondary">{status_label}</Badge>
          </div>
          <PageTitle className="wrap-anywhere">{account.name}</PageTitle>
        </div>
        {actions}
      </header>
      <AppSection>
        <dl className="flex flex-wrap items-start gap-x-12 gap-y-6">
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-sm text-muted-foreground">{balance_label}</dt>
            <dd>
              <Money
                value={account.functionalBalance}
                className="font-heading text-4xl font-medium tracking-tight tabular-nums wrap-anywhere sm:text-5xl"
              />
            </dd>
          </div>
          <CategoryTransactionCount transactionCount={transactionCount} />
        </dl>
      </AppSection>
      <Separator />
    </div>
  );
}

export function CategorySummarySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_summary');

  return (
    <div aria-busy="true" className="flex min-w-0 flex-col">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-9 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24" />
      </header>
      <AppSection>
        <dl className="flex flex-wrap items-start gap-x-12 gap-y-6">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-56 max-w-full sm:h-12" />
          </div>
          <CategoryTransactionCountSkeleton />
        </dl>
      </AppSection>
      <Separator />
    </div>
  );
}
