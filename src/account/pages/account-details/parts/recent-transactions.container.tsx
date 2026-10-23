import { useDebounce } from '@/shared/hooks/use-debounce';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountTransactions } from '../hooks/use-account-transactions';
import type { AccountSectionProps } from '../types';
import { RecentTransactions } from './recent-transactions';
import { RecentTransactionsSkeleton } from './recent-transactions-skeleton';
import { SectionError } from './section-error';

export function RecentTransactionsContainer({
  accountId,
}: Readonly<AccountSectionProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebounce(search, 300);

  const transactions = useAccountTransactions(accountId, {
    page,
    limit: 5,
    orderBy: 'effectiveDate',
    sortDirection,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const title = t('details_transactions_title');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (
    _key: 'effectiveDate',
    direction: 'asc' | 'desc' | null
  ) => {
    setSortDirection(direction ?? 'asc');
    setPage(1);
  };

  if (transactions.isPending) return <RecentTransactionsSkeleton />;

  if (transactions.isError)
    return (
      <SectionError title={title} onRetry={() => void transactions.refetch()} />
    );

  const empty =
    !transactions.isPlaceholderData &&
    transactions.data.meta.total === 0 &&
    !search &&
    !debouncedSearch;

  return (
    <RecentTransactions
      transactions={transactions.data.data}
      pagination={transactions.data.meta}
      search={search}
      empty={empty}
      sortDirection={sortDirection}
      onSearchChange={handleSearchChange}
      onPageChange={setPage}
      onSortChange={handleSortChange}
    />
  );
}
