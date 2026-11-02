import {
  TransactionsTable,
  TransactionsTableSkeleton,
} from '@/journal-entries/components/transactions-table';
import { Button } from '@/shared/components/button';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type {
  CategoryPartWithStateProps,
  CategoryTransactionsProps,
} from '../types';
import { CategoryDetailsError } from './section-error';

export function CategoryTransactions({
  entries,
  total,
  selectedCounterparty,
  onClearCounterparty,
  transactionsHref,
}: Readonly<CategoryTransactionsProps>) {
  const { t } = useTranslation('ledger-accounts');

  const clear_filter_label = t('category_details_clear_filter_label', {
    name: selectedCounterparty,
  });

  const view_all_label = t('category_details_view_all_transactions_label');

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {selectedCounterparty !== null && (
        <div>
          <Button variant="outline" size="sm" onClick={onClearCounterparty}>
            {clear_filter_label}
          </Button>
        </div>
      )}
      <TransactionsTable data={entries} sortable={false} />
      {total > 10 && transactionsHref && (
        <div className="flex justify-end">
          <Button variant="link" asChild>
            <Link to={transactionsHref}>{view_all_label}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function CategoryTransactionsWithState({
  loading,
  error,
  children,
}: Readonly<CategoryPartWithStateProps>) {
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
      loading={<CategoryTransactionsSkeleton />}
      error={<CategoryDetailsError />}
    >
      {() => children}
    </WithTransitionState>
  );
}

export function CategoryTransactionsSkeleton() {
  return <TransactionsTableSkeleton />;
}
