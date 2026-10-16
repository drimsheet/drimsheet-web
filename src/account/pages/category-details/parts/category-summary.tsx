import { Badge } from '@/shared/components/badge';
import { Money } from '@/shared/components/money';
import { Separator } from '@/shared/components/separator';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { CategorySummaryProps } from '../types';

export function CategorySummary({
  account,
  transactionCount,
  actions,
}: Readonly<CategorySummaryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');

  const type_label = t(
    account.type === 'revenue'
      ? 'categories_type_revenue'
      : 'categories_type_expense'
  );

  const status_label = t(`categories_status_${account.status}`);

  const balance_label = t('category_details_balance_label');
  const transactions_label = t('categories_transactions_label');
  const count_description = t('category_details_count_description');
  const loading_label = t('category_details_loading_count_label');

  const count_text =
    transactionCount === null
      ? '—'
      : transactionCount?.toLocaleString(i18n.resolvedLanguage);

  return (
    <section className="flex min-w-0 flex-col gap-7" aria-label={account.name}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{type_label}</Badge>
            <Badge variant="secondary">{status_label}</Badge>
          </div>
          <h1 className="m-0 font-heading text-3xl font-medium tracking-tight wrap-anywhere">
            {account.name}
          </h1>
        </div>
        {actions}
      </header>
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
        <div className="flex flex-col gap-2">
          <dt className="text-sm text-muted-foreground">
            {transactions_label}
          </dt>
          <dd className="font-heading text-3xl font-medium tabular-nums">
            {transactionCount === undefined ? (
              <Skeleton className="h-9 w-16" aria-label={loading_label} />
            ) : (
              count_text
            )}
          </dd>
          <dd className="text-xs text-muted-foreground">{count_description}</dd>
        </div>
      </dl>
      <Separator />
    </section>
  );
}
