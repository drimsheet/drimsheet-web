import { journalEntriesQueryKey } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryQueryKey } from '@/journal-entries/hooks/use-journal-entry';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalEntryService.deleteJournalEntry(id),

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: journalEntriesQueryKey }),
        queryClient.invalidateQueries({ queryKey: journalEntryQueryKey(id) }),
      ]);
    },
  });
}
