import type { IJournalEntryTableFilters } from '@/journal-entries/components/transactions-table';
import type { IGetJournalEntriesQuery } from '@/shared/lib/api/Api';

function recordedDateBound(
  value: string | undefined,
  end: boolean
): string | undefined {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (end) {
    date.setHours(23, 59, 59, 999);
  }

  return date.toISOString();
}

function toQuery(
  filters: IJournalEntryTableFilters,
  query: Pick<
    IGetJournalEntriesQuery,
    'page' | 'limit' | 'search' | 'orderBy' | 'sortDirection'
  >
): IGetJournalEntriesQuery {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search?.trim() || undefined,
    orderBy: query.orderBy,
    sortDirection: query.sortDirection,
    effectiveDateFrom: filters.effectiveDateFrom,
    effectiveDateTo: filters.effectiveDateTo,
    createdAtFrom: recordedDateBound(filters.recordedDateFrom, false),
    createdAtTo: recordedDateBound(filters.recordedDateTo, true),
    sourceType: filters.sourceType,
    accountId: filters.accountId ?? filters.categoryId,
    counterpartyId: filters.counterpartyId,
    currencyCode: filters.currencyCode,
  };
}

export const journalEntryQueryMapper = Object.freeze({ toQuery });
