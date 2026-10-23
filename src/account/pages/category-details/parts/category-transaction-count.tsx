import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { CategoryTransactionCountProps } from '../types';

export function CategoryTransactionCount({
  transactionCount,
}: Readonly<CategoryTransactionCountProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  if (transactionCount === undefined)
    return <CategoryTransactionCountSkeleton />;

  const count_text =
    transactionCount === null
      ? '—'
      : transactionCount.toLocaleString(i18n.resolvedLanguage);

  const categories_transactions_label = t('categories_transactions_label');

  const category_details_count_description = t(
    'category_details_count_description'
  );

  return (
    <div className="flex flex-col gap-2">
      <dt className="text-sm text-muted-foreground">
        {categories_transactions_label}
      </dt>
      <dd className="font-heading text-3xl font-medium tabular-nums">
        {count_text}
      </dd>
      <dd className="text-xs text-muted-foreground">
        {category_details_count_description}
      </dd>
    </div>
  );
}

export function CategoryTransactionCountSkeleton() {
  const { t } = useTranslation('ledger-accounts');

  const category_details_loading_count_label = t(
    'category_details_loading_count_label'
  );

  const categories_transactions_label = t('categories_transactions_label');

  const category_details_count_description = t(
    'category_details_count_description'
  );

  return (
    <div aria-busy="true" className="flex flex-col gap-2">
      <dt className="text-sm text-muted-foreground">
        {categories_transactions_label}
      </dt>
      <dd>
        <output
          className="sr-only"
          aria-label={category_details_loading_count_label}
          aria-busy="true"
        >
          {category_details_loading_count_label}
        </output>
        <Skeleton className="h-9 w-16" />
      </dd>
      <dd className="text-xs text-muted-foreground">
        {category_details_count_description}
      </dd>
    </div>
  );
}
