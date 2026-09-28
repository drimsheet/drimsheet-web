import {
  CounterpartyDetails,
  CounterpartyDetailsSkeleton,
} from '@/counterparty/components/counterparty-details';
import { useCounterparty } from '@/counterparty/hooks/use-counterparty';
import { useCounterpartyTransactions } from '@/counterparty/hooks/use-counterparty-transactions';
import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import { AppBody, AppHeader } from '@/shared/components/app';
import { PageBreadcrumbs } from '@/shared/components/page-breadcrumbs';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  EJournalEntrySortBy,
  EPaginationSortDirection,
} from '@/shared/lib/api/Api';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';

export function CounterpartyDetailsPage() {
  const { counterpartyId } = useParams();
  const { t } = useTranslation(['counterparty', 'shared']);
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    EPaginationSortDirection.Desc
  );
  const debouncedSearch = useDebounce(search, 300);
  const { data: counterparty, isPending } = useCounterparty(counterpartyId);
  const transactions = useCounterpartyTransactions(
    {
      counterpartyId,
      page: 1,
      limit: 5,
      orderBy: EJournalEntrySortBy.EffectiveDate,
      sortDirection,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    Boolean(counterparty)
  );

  const handleSortChange = (
    _key: 'effectiveDate',
    direction: 'asc' | 'desc' | null
  ) => {
    setSortDirection(direction ?? EPaginationSortDirection.Asc);
  };

  if (!counterpartyId) return <Navigate replace to="/counterparties" />;
  if (isPending) return <CounterpartyDetailsPending />;

  // TODO: create a shared 404 component
  if (!counterparty) return <Navigate replace to="/counterparties" />;

  const transactionsHref = `/transactions?${new URLSearchParams({ counterpartyId })}`;

  const counterparties_label = t('shared:counterparties');
  const all_counterparties_label = t('all_counterparties_label');
  const recent_transactions_title = t('recent_transactions_title');
  const view_transactions_label = t('view_transactions_label');
  const count_text = t('transactions_count_text', {
    count: transactions.data?.data.length ?? 0,
    total: transactions.data?.meta.total ?? 0,
  });

  return (
    <>
      <AppHeader breadcrumbs={[{ label: counterparties_label }]} />
      <AppBody>
        <PageBreadcrumbs
          breadcrumb={{
            label: all_counterparties_label,
            link: '/counterparties',
            next: { label: counterparty.name },
          }}
        />
        <CounterpartyDetails counterparty={counterparty}>
          <section
            className="min-w-0 flex flex-col gap-6"
            aria-labelledby="recent-transactions-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mt-15">
              <h2
                id="recent-transactions-title"
                className="text-xl font-medium"
              >
                {recent_transactions_title}
              </h2>
              <Link
                className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
                to={transactionsHref}
              >
                {view_transactions_label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <TransactionsTable
              data={transactions.data?.data ?? []}
              loading={transactions.isPending}
              searchValue={search}
              onSearchChange={setSearch}
              currentSortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
            {transactions.isSuccess && (
              <p className="text-sm text-muted-foreground">{count_text}</p>
            )}
          </section>
        </CounterpartyDetails>
      </AppBody>
    </>
  );
}

function CounterpartyDetailsPending() {
  const { t } = useTranslation(['counterparty', 'shared']);

  const counterparties_label = t('shared:counterparties');
  const all_counterparties_label = t('all_counterparties_label');
  const details_title = t('details_title');

  return (
    <>
      <AppHeader breadcrumbs={[{ label: counterparties_label }]} />
      <AppBody>
        <PageBreadcrumbs
          isLoading
          breadcrumb={{
            label: all_counterparties_label,
            link: '/counterparties',
            next: { label: details_title },
          }}
        />
        <CounterpartyDetailsSkeleton />
      </AppBody>
    </>
  );
}
