import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import { Button } from '@/shared/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/shared/components/empty';
import { SearchField } from '@/shared/components/search-field';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { RecentTransactionsProps } from '../types';

export function RecentTransactions({
  counterpartyName,
  empty,
  transactions,
  loading,
  search,
  sortDirection,
  total,
  transactionsHref,
  onSearchChange,
  onSortChange,
}: Readonly<RecentTransactionsProps>) {
  const { t } = useTranslation(['counterparty', 'journal-entries']);
  const empty_title = t('no_transactions_title');

  const empty_description = t('no_transactions_description', {
    name: counterpartyName,
  });

  const search_placeholder = t(
    'journal-entries:transactions_table_search_placeholder'
  );

  const view_transactions_label = t('view_transactions_label');

  const count_text = t('transactions_count_text', {
    count: transactions.length,
    total: total ?? 0,
  });

  return (
    <>
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
        data={transactions}
        loading={loading}
        currentSortDirection={sortDirection}
        onSortChange={onSortChange}
        emptyStateNode={
          empty ? (
            <Empty className="p-0 md:p-0">
              <EmptyHeader>
                <EmptyTitle className="text-sm">
                  <h3>{empty_title}</h3>
                </EmptyTitle>
                <EmptyDescription>{empty_description}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : undefined
        }
      />
      {!loading && total !== undefined && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <output className="text-sm text-muted-foreground">
            {count_text}
          </output>
          {!empty && (
            <Button variant="link" asChild className="px-0">
              <Link to={transactionsHref}>
                {view_transactions_label}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
