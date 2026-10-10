import { CounterpartyDeletionDialog } from '@/counterparty/dialogs/counterparty-deletion';
import { CounterpartyUpdateDialog } from '@/counterparty/dialogs/counterparty-update';
import { useArchiveCounterparty } from '@/counterparty/hooks/use-archive-counterparty';
import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import { useCheckCounterpartyDeletionEligibility } from '@/counterparty/hooks/use-counterparty-deletion-eligibility';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { getCounterpartyFormRole } from '@/counterparty/lib/utils/counterparty-form';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CounterpartiesTable } from './counterparties-table';

interface CounterpartiesTableContainerProps {
  onAddCounterparty: () => void;
}

export function CounterpartiesTableContainer({
  onAddCounterparty,
}: Readonly<CounterpartiesTableContainerProps>) {
  const { t } = useTranslation('counterparty');
  const [, setSearchParams] = useSearchParams();
  const handleApiError = useApiErrorHandler();

  const { mutateAsync: archive, isPending: archiving } =
    useArchiveCounterparty();

  const checkDeletionEligibility = useCheckCounterpartyDeletionEligibility();

  const tableQuery = useTableQueryParams<
    keyof ICounterpartyDto,
    'status' | 'counterpartyType' | 'roles'
  >({ filterKeys: ['status', 'counterpartyType', 'roles'] });

  const updateFilters = tableQuery.handleFilterChange;

  const debouncedSearchQuery = useDebounce(tableQuery.searchQuery, 300);
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([]);

  const [counterpartyToDelete, setCounterpartyToDelete] =
    useState<ICounterpartyDto | null>(null);

  const limit = 10;

  const filters = useMemo(() => {
    const { counterpartyType, ...remainingFilters } = tableQuery.filters;

    return {
      ...remainingFilters,
      ...(counterpartyType ? { type: counterpartyType } : {}),
    };
  }, [tableQuery.filters]);

  const query = useMemo(
    () =>
      counterpartyMapper.toGetCounterpartiesQuery({
        search: debouncedSearchQuery,
        page: tableQuery.page,
        limit,
        sortKey: tableQuery.sortKey,
        sortDirection: tableQuery.sortDirection,
        filters,
      }),
    [
      debouncedSearchQuery,
      filters,
      tableQuery.page,
      tableQuery.sortDirection,
      tableQuery.sortKey,
    ]
  );

  const { data: counterpartiesData, isLoading } = useCounterparties(query);

  const handleFilterChange = useCallback(
    (nextFilters: Record<string, (string | number)[]>) => {
      const { type, ...remainingFilters } = nextFilters;

      updateFilters({
        ...remainingFilters,
        ...(type ? { counterpartyType: type } : {}),
      });
    },
    [updateFilters]
  );

  const handleEditCounterparty = useCallback(
    (counterparty: ICounterpartyDto) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('id', counterparty.id);
        next.set('type', getCounterpartyFormRole(counterparty));
        next.delete('edit');
        next.delete('editCounterpartyRole');

        return next;
      });
    },
    [setSearchParams]
  );

  const handleCloseEdit = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('id');
        next.delete('type');
        next.delete('editCounterpartyRole');

        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const handleArchiveCounterparty = async (counterparty: ICounterpartyDto) => {
    try {
      await archive(counterparty.id);
      toast.success(t('counterparty_archived_success_text'));
    } catch (error) {
      handleApiError(error, { showToast: true });
      throw error;
    }
  };

  const handleCheckCounterpartyDeleteEligibility = async (
    counterparty: ICounterpartyDto
  ) => {
    try {
      const eligibility = await checkDeletionEligibility(counterparty.id);

      return eligibility.canDelete;
    } catch (error) {
      handleApiError(error);

      return false;
    }
  };

  const handleCounterpartyDeleted = (counterpartyId: string) => {
    setSelectedRowIds((current) =>
      current.filter((selectedId) => selectedId !== counterpartyId)
    );
  };

  return (
    <>
      <CounterpartiesTable
        archiving={archiving}
        getCounterpartyHref={(id) =>
          `/counterparties/${encodeURIComponent(id)}`
        }
        onAddCounterparty={onAddCounterparty}
        onArchiveCounterparty={handleArchiveCounterparty}
        onCheckCounterpartyDeleteEligibility={
          handleCheckCounterpartyDeleteEligibility
        }
        onDeleteCounterparty={setCounterpartyToDelete}
        onEditCounterparty={handleEditCounterparty}
        data={counterpartiesData?.data ?? []}
        loading={isLoading}
        selectable
        selectedRowIds={selectedRowIds}
        onRowSelectionChange={setSelectedRowIds}
        onSortChange={tableQuery.handleSortChange}
        onFilterChange={handleFilterChange}
        currentSortKey={tableQuery.sortKey as string}
        currentSortDirection={tableQuery.sortDirection}
        searchValue={tableQuery.searchQuery}
        onSearchChange={tableQuery.handleSearchChange}
        filters={filters}
        pagination={counterpartiesData?.meta}
        onPageChange={tableQuery.handlePageChange}
      />

      <CounterpartyUpdateDialog onClose={handleCloseEdit} />
      <CounterpartyDeletionDialog
        counterparty={counterpartyToDelete}
        onClose={() => setCounterpartyToDelete(null)}
        onDeleted={handleCounterpartyDeleted}
      />
    </>
  );
}
