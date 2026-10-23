import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import { Empty, EmptyHeader, EmptyTitle } from '@/shared/components/empty';
import { PageSection } from '@/shared/components/page-section';
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
