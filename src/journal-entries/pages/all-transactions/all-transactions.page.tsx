import {
  TransactionsTable,
  type IJournalEntryTableFilters,
} from '@/journal-entries/components/transactions-table';
import { useArchiveJournalEntry } from '@/journal-entries/hooks/use-archive-journal-entry';
import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { useVoidEntry } from '@/journal-entries/hooks/use-void-entry';
import { journalEntryQueryMapper } from '@/journal-entries/lib/mappers/journal-entry-query.mapper';
import { journalEntryRouteMapper } from '@/journal-entries/lib/mappers/journal-entry-route.mapper';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  EJournalEntryStatus,
  type IJournalEntryListDto,
  type UJournalEntrySortBy,
} from '@/shared/lib/api/Api';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTransactionFilterOptions } from './hooks/use-transaction-filter-options';

export function AllTransactionsPage() {
  const { t } = useTranslation('journal-entries');
  const navigate = useNavigate();

  const [params] = useSearchParams();

  const [filters, setFilters] = useState<IJournalEntryTableFilters>(() => ({
    accountId: params.get('accountId') ?? undefined,
    effectiveDateFrom: params.get('effectiveDateFrom') ?? undefined,
    effectiveDateTo: params.get('effectiveDateTo') ?? undefined,
    counterpartyId: params.get('counterpartyId') ?? undefined,
  }));

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState<{
    key: UJournalEntrySortBy;
    direction: 'asc' | 'desc';
  }>({ key: 'effectiveDate', direction: 'desc' });

  const debouncedSearch = useDebounce(search, 300);
  const filterOptions = useTransactionFilterOptions();
  const handleApiError = useApiErrorHandler();
  const archive = useArchiveJournalEntry();
  const remove = useDeleteJournalEntry();
  const voidEntry = useVoidEntry();

  const query = journalEntryQueryMapper.toQuery(filters, {
    page,
    limit: 25,
    search: debouncedSearch,
    orderBy: sort.key,
    sortDirection: sort.direction,
  });

  const transactions = useJournalEntries(query, { throwOnError: false });

  const handleSearchChange = (next: string) => {
    setSearch(next);
    setPage(1);
  };

  const handleApply = (next: IJournalEntryTableFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleSortChange = (
    key: UJournalEntrySortBy,
    direction: 'asc' | 'desc' | null
  ) => {
    setSort({ key, direction: direction ?? 'asc' });
    setPage(1);
  };

  const handleEdit = (entry: IJournalEntryListDto) => {
    const type = journalEntryRouteMapper.toRouteType(entry.sourceType);
    if (type) {
      void navigate(`/transactions/${type}/${entry.id}/edit`);
    }
  };

  const handleArchive = async (entry: IJournalEntryListDto) => {
    await archive.mutateAsync(entry.id);
    setPage(1);
  };

  const handleDelete = async (entry: IJournalEntryListDto) => {
    try {
      if (entry.status === EJournalEntryStatus.Draft) {
        await remove.mutateAsync(entry.id);
      } else if (entry.status === EJournalEntryStatus.Posted) {
        await voidEntry.mutateAsync(entry.id);
      } else {
        return;
      }

      setPage(1);
    } catch (error) {
      handleApiError(error, { showToast: true });
      throw error;
    }
  };

  const handleAdd = () => {
    void navigate('/transactions/inflow');
  };

  const page_title = t('all_transactions_title');
  const add_label = t('all_transactions_add_action');

  return (
    <AppBody
      title={page_title}
      actionsSlot={
        <Button onClick={handleAdd}>
          <Plus data-icon="inline-start" />
          {add_label}
        </Button>
      }
    >
      <AppSection>
        <TransactionsTable
          data={transactions.data?.data ?? []}
          loading={transactions.isPending || search !== debouncedSearch}
          error={transactions.isError}
          showRecordedOn
          currentSortKey={sort.key}
          currentSortDirection={sort.direction}
          onSortChange={handleSortChange}
          pagination={transactions.data?.meta}
          onPageChange={setPage}
          archiving={archive.isPending}
          onArchiveTransaction={handleArchive}
          onDeleteTransaction={handleDelete}
          onEditTransaction={handleEdit}
          filter={{
            value: filters,
            onApply: handleApply,
            options: filterOptions.options,
            optionsLoading: filterOptions.loading,
            optionsError: filterOptions.error,
            search,
            onSearchChange: handleSearchChange,
          }}
        />
      </AppSection>
    </AppBody>
  );
}
