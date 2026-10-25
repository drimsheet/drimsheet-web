import {
  TransactionsTable,
  TransactionsTableSkeleton,
} from '@/journal-entries/components/transactions-table';
import { AppSection } from '@/shared/components/app-section';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/shared/components/empty';
import { SearchField } from '@/shared/components/search-field';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { RecentTransactionsProps } from '../types';

export function RecentTransactions({
  accountId,
  transactions,
  pagination,
  search,
  empty,
  sortDirection,
  onSearchChange,
  onPageChange,
  onSortChange,
}: Readonly<RecentTransactionsProps>) {
  const { t } = useTranslation(['ledger-accounts', 'journal-entries']);
  const title = t('details_transactions_title');

  const search_placeholder = t(
    'journal-entries:transactions_table_search_placeholder'
  );

  const empty_text = t('details_transactions_empty_text');
  const empty_description = t('details_transactions_empty_description');

  return (
    <AppSection title={title} className="py-0">
      <div className="w-full max-w-sm">
        <SearchField
          type="search"
          aria-label={search_placeholder}
          placeholder={search_placeholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <TransactionsTable
        accountId={accountId}
        data={transactions}
        pagination={pagination && pagination.total > 0 ? pagination : undefined}
        onPageChange={onPageChange}
        currentSortDirection={sortDirection}
        onSortChange={onSortChange}
        emptyStateNode={
          empty ? (
            <Empty className="p-0 md:p-0">
              <EmptyHeader>
                <EmptyTitle className="text-sm">{empty_text}</EmptyTitle>
                <EmptyDescription>{empty_description}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : undefined
        }
      />
    </AppSection>
  );
}

export function RecentTransactionsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_recent_transactions');

  return (
    <AppSection aria-busy="true" className="py-0">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-full max-w-sm" />
        <TransactionsTableSkeleton />
      </div>
    </AppSection>
  );
}
