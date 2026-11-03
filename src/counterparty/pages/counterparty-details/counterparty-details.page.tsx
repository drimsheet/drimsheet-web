import {
  CounterpartyDetails,
  CounterpartyDetailsSkeleton,
} from '@/counterparty/components/counterparty-details';
import { CounterpartyProfileActions } from '@/counterparty/components/counterparty-profile-actions';
import { CounterpartyDeletionDialog } from '@/counterparty/dialogs/counterparty-deletion';
import { CounterpartyUpdateDialog } from '@/counterparty/dialogs/counterparty-update';
import { useCounterparty } from '@/counterparty/hooks/use-counterparty';
import { useCounterpartyDeletionEligibility } from '@/counterparty/hooks/use-counterparty-deletion-eligibility';
import { useCounterpartyTransactions } from '@/counterparty/hooks/use-counterparty-transactions';
import { getCounterpartyFormRole } from '@/counterparty/lib/utils/counterparty-form';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { StatusBadge } from '@/shared/components/status-badge';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  EJournalEntrySortBy,
  EPaginationSortDirection,
} from '@/shared/lib/api/Api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { OverviewContainer } from './parts/overview.container';
import { RecentTransactions } from './parts/recent-transactions';

export function CounterpartyDetailsPage() {
  const { counterpartyId } = useParams();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { t } = useTranslation(['counterparty', 'shared', 'journal-entries']);
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
    if (!counterparty || counterparty.status === 'archived') {
      return;
    }

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

  const handleSortChange = (_key: string, direction: 'asc' | 'desc' | null) => {
    setSortDirection(direction ?? EPaginationSortDirection.Asc);
  };

  const overview_title = t('overview_title');
  const transactions_title = t('recent_transactions_title');
  const people_label = t('shared:counterparties');
  const loading_title = t('details_title');

  const breadcrumbs = {
    label: people_label,
    link: '/counterparties',
    next: counterparty ? { label: counterparty.name } : undefined,
  };

  if (!counterpartyId || (!isPending && !counterparty)) {
    return <Navigate replace to="/counterparties" />;
  }

  const transactionsHref = `/transactions?${new URLSearchParams({ counterpartyId })}`;

  const hasNoTransactions =
    transactions.isSuccess &&
    !transactions.isPlaceholderData &&
    transactions.data.meta.total === 0 &&
    !search &&
    !debouncedSearch;

  const status_label = counterparty ? t(`shared:${counterparty.status}`) : '';
  const type_label = counterparty ? t(`${counterparty.type}_label`) : undefined;

  return (
    <>
      <AppBody
        breadcrumbs={breadcrumbs}
        title={counterparty?.name ?? loading_title}
        description={type_label}
        titleBadgeSlot={
          counterparty && (
            <StatusBadge
              label={status_label}
              variant={counterparty.status === 'active' ? 'success' : 'neutral'}
            />
          )
        }
        actionsSlot={
          counterparty && (
            <CounterpartyProfileActions
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
            />
          )
        }
      >
        <AppSection>
          {isPending ? (
            <CounterpartyDetailsSkeleton />
          ) : (
            counterparty && <CounterpartyDetails counterparty={counterparty} />
          )}
        </AppSection>
        <AppSection title={overview_title}>
          <OverviewContainer
            key={counterpartyId}
            counterpartyId={counterparty?.id}
          />
        </AppSection>
        <AppSection title={transactions_title}>
          <RecentTransactions
            counterpartyName={counterparty?.name ?? ''}
            empty={hasNoTransactions}
            transactions={transactions.data?.data ?? []}
            loading={isPending || transactions.isPending}
            search={search}
            onSearchChange={setSearch}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            transactionsHref={transactionsHref}
            total={
              transactions.isSuccess && !transactions.isPlaceholderData
                ? transactions.data.meta.total
                : undefined
            }
          />
        </AppSection>
      </AppBody>
      {counterparty && (
        <>
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
      )}
    </>
  );
}
