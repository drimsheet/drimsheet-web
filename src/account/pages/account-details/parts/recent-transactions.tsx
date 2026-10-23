import {
  TransactionsTable,
  TransactionsTableSkeleton,
} from '@/journal-entries/components/transactions-table';
import { Empty, EmptyHeader, EmptyTitle } from '@/shared/components/empty';
import { PageSection } from '@/shared/components/page-section';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { RecentTransactionsProps } from '../types';

export function RecentTransactions({
  transactions,
  pagination,
  search,
  empty,
  sortDirection,
  onSearchChange,
  onPageChange,
  onSortChange,
}: Readonly<RecentTransactionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const title = t('details_transactions_title');
  const empty_text = t('details_transactions_empty_text');

  return (
    <PageSection title={title}>
      {empty && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{empty_text}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
      {!empty && (
        <TransactionsTable
          data={transactions}
          pagination={pagination}
          searchValue={search}
          onSearchChange={onSearchChange}
          onPageChange={onPageChange}
          currentSortDirection={sortDirection}
          onSortChange={onSortChange}
          className="border-0 shadow-none [&_thead]:border-0 [&_tr]:border-0"
        />
      )}
    </PageSection>
  );
}

export function RecentTransactionsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_recent_transactions');

  return (
    <PageSection aria-busy="true">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-48" />
        <TransactionsTableSkeleton />
      </div>
    </PageSection>
  );
}
