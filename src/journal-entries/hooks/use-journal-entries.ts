import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type {
  IGetJournalEntriesQuery,
  IPaginatedResponseIJournalEntryListDto,
} from '@/shared/lib/api/Api';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export const journalEntriesQueryKey = [
  'journalEntryService',
  'getJournalEntries',
] as const;

export function useJournalEntries(
  query: IGetJournalEntriesQuery,
  options?: Pick<
    UseQueryOptions<IPaginatedResponseIJournalEntryListDto>,
    'placeholderData' | 'throwOnError' | 'enabled'
  >
) {
  return useQuery({
    queryKey: [...journalEntriesQueryKey, query],
    queryFn: () => journalEntryService.getJournalEntries(query),
    throwOnError: options?.throwOnError ?? true,
    placeholderData: options?.placeholderData,
    enabled: options?.enabled,
  });
}
