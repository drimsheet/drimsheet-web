import {
  CounterpartyDetails,
  CounterpartyDetailsSkeleton,
} from '@/counterparty/components/counterparty-details';
import { CounterpartyDeletionDialog } from '@/counterparty/dialogs/counterparty-deletion';
import { CounterpartyUpdateDialog } from '@/counterparty/dialogs/counterparty-update';
import { useCounterparty } from '@/counterparty/hooks/use-counterparty';
import { useCounterpartyDeletionEligibility } from '@/counterparty/hooks/use-counterparty-deletion-eligibility';
import { useCounterpartyTransactions } from '@/counterparty/hooks/use-counterparty-transactions';
import { getCounterpartyFormRole } from '@/counterparty/lib/utils/counterparty-form';
import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import { AppBody, AppHeader } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  EJournalEntrySortBy,
  EPaginationSortDirection,
} from '@/shared/lib/api/Api';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { RecentTransactions } from './parts/recent-transactions';

export function CounterpartyDetailsPage() {
  const { counterpartyId } = useParams();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { t } = useTranslation(['counterparty', 'shared']);
  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    EPaginationSortDirection.Desc
  );

  const debouncedSearch = useDebounce(search, 300);
  const { data: counterparty, isPending } = useCounterparty(counterpartyId);

  const deletionEligibility = useCounterpartyDeletionEligibility(
    counterpartyId,
    actionsOpen && Boolean(counterparty)
  );

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

  const handleEdit = () => {
    if (!counterparty || counterparty.status === 'archived') return;

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('edit', 'true');
      next.delete('id');
      next.delete('type');
      next.delete('editCounterpartyRole');

      return next;
    });
  };

  const handleCloseEdit = () => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('edit');
        next.delete('id');
        next.delete('type');
        next.delete('editCounterpartyRole');

        return next;
      },
      { replace: true }
    );
  };

  const handleSortChange = (
    _key: 'effectiveDate',
    direction: 'asc' | 'desc' | null
  ) => {
    setSortDirection(direction ?? EPaginationSortDirection.Asc);
  };

  const counterparties_label = t('shared:counterparties');
  const all_counterparties_label = t('all_counterparties_label');

  if (!counterpartyId) return <Navigate replace to="/counterparties" />;

  if (isPending)
    return (
      <>
        <AppHeader breadcrumbs={[{ label: counterparties_label }]} />
        <AppBody>
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <Button
              variant="link"
              asChild
              className="w-fit px-0 text-muted-foreground"
            >
              <Link to="/counterparties">
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                {all_counterparties_label}
              </Link>
            </Button>
            <CounterpartyDetailsSkeleton />
          </div>
        </AppBody>
      </>
    );

  // TODO: create a shared 404 component
  if (!counterparty) return <Navigate replace to="/counterparties" />;

  const transactionsHref = `/transactions?${new URLSearchParams({ counterpartyId })}`;

  const view_transactions_label = t('view_transactions_label');

  const hasNoTransactions =
    transactions.isSuccess &&
    !transactions.isPlaceholderData &&
    transactions.data.meta.total === 0 &&
    !search &&
    !debouncedSearch;

  const count_text = t('transactions_count_text', {
    count: transactions.data?.data.length ?? 0,
    total: transactions.data?.meta.total ?? 0,
  });

  return (
    <>
      <AppHeader breadcrumbs={[{ label: counterparties_label }]} />
      <AppBody>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <Button
            variant="link"
            asChild
            className="w-fit px-0 text-muted-foreground"
          >
            <Link to="/counterparties">
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              {all_counterparties_label}
            </Link>
          </Button>
          <CounterpartyDetails
            counterparty={counterparty}
            deleteEligibilityChecking={
              deletionEligibility.isPending || deletionEligibility.isFetching
            }
            deletable={
              deletionEligibility.isSuccess &&
              deletionEligibility.data.canDelete
            }
            onActionsOpenChange={setActionsOpen}
            onDelete={() => setDeleteOpen(true)}
            onEdit={handleEdit}
            editDisabled={counterparty.status === 'archived'}
          >
            <RecentTransactions
              counterpartyName={counterparty.name}
              empty={hasNoTransactions}
            >
              <TransactionsTable
                actionButton={
                  <Button variant="link" asChild className="px-0">
                    <Link to={transactionsHref}>
                      {view_transactions_label}
                      <ArrowRight data-icon="inline-end" aria-hidden="true" />
                    </Link>
                  </Button>
                }
                data={transactions.data?.data ?? []}
                loading={transactions.isPending}
                searchValue={search}
                onSearchChange={setSearch}
                currentSortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
              {transactions.isSuccess && !transactions.isPlaceholderData && (
                <p className="text-sm text-muted-foreground">{count_text}</p>
              )}
            </RecentTransactions>
          </CounterpartyDetails>
        </div>
      </AppBody>
      <CounterpartyUpdateDialog
        counterpartyId={counterpartyId}
        type={counterparty.type}
        role={getCounterpartyFormRole(counterparty)}
        onClose={handleCloseEdit}
      />
      <CounterpartyDeletionDialog
        counterparty={deleteOpen ? counterparty : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate('/counterparties')}
      />
    </>
  );
}
