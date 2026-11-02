import { FieldError } from '@/shared/components/field';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import type {
  CategoryBalanceProps,
  CategorySummaryProps,
  CategorySummarySkeletonProps,
  CategorySummaryWithStateProps,
} from '../types';
import {
  CategoryTransactionCount,
  CategoryTransactionCountSkeleton,
} from './category-transaction-count';
import { CategoryDetailsError } from './section-error';

export function CategorySummary({
  account,
  transactionCount,
  intervalSlot,
  rangeError,
  balance,
}: Readonly<CategorySummaryProps>) {
  const { t } = useTranslation('ledger-accounts');

  const balance_label = t('category_details_balance_label');

  return (
    <div className="flex min-w-0 flex-col gap-8" aria-label={account.name}>
      <div className="flex flex-col gap-6">
        {intervalSlot && (
          <div className="flex items-center justify-start gap-3">
            {intervalSlot}
          </div>
        )}
        <FieldError>{rangeError}</FieldError>
        <dl className="flex flex-wrap items-start gap-x-24 gap-y-6">
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-sm text-muted-foreground">{balance_label}</dt>
            <dd>
              <CategoryBalance
                balance={
                  balance === undefined && !intervalSlot
                    ? account.functionalBalance
                    : balance
                }
              />
            </dd>
          </div>
          <CategoryTransactionCount transactionCount={transactionCount} />
        </dl>
      </div>
    </div>
  );
}

export function CategorySummarySkeleton({
  showPeriod = false,
}: Readonly<CategorySummarySkeletonProps>) {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_summary');

  return (
    <div aria-busy="true" className="flex min-w-0 flex-col gap-8">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex flex-col gap-6">
        {showPeriod && (
          <div className="flex items-center justify-start gap-3">
            <Skeleton className="h-9 w-48" />
          </div>
        )}
        <dl className="flex flex-wrap items-start gap-x-24 gap-y-6">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-56 max-w-full sm:h-12" />
          </div>
          <CategoryTransactionCountSkeleton />
        </dl>
      </div>
    </div>
  );
}

export function CategorySummaryWithState({
  loading,
  error,
  showPeriod,
  children,
}: Readonly<CategorySummaryWithStateProps>) {
  let state: 'loading' | 'error' | 'success' = 'success';
  if (loading) {
    state = 'loading';
  } else if (error) {
    state = 'error';
  }

  return (
    <WithTransitionState
      state={state}
      data={true}
      loading={<CategorySummarySkeleton showPeriod={showPeriod} />}
      error={<CategoryDetailsError />}
    >
      {() => children}
    </WithTransitionState>
  );
}

export function CategoryBalance({ balance }: Readonly<CategoryBalanceProps>) {
  if (balance === undefined) {
    return <CategoryBalanceSkeleton />;
  }

  if (balance === null) {
    return <span>—</span>;
  }

  return (
    <Money
      value={balance}
      className="font-heading text-4xl font-medium tracking-tight tabular-nums wrap-anywhere sm:text-5xl"
    />
  );
}

export function CategoryBalanceSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_summary');

  return (
    <div aria-busy="true">
      <output className="sr-only">{loading_label}</output>
      <Skeleton className="h-10 w-56 max-w-full sm:h-12" />
    </div>
  );
}
