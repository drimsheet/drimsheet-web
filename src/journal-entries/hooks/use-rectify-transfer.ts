import { journalEntriesQueryKey } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryQueryKey } from '@/journal-entries/hooks/use-journal-entry';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type { UTransferRectificationRequest } from '@/journal-entries/lib/types/journal-entry-rectification.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface IInput {
  id: string;
  request: UTransferRectificationRequest;
}

export function useRectifyTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: IInput) =>
      journalEntryService.rectifyTransfer(id, request),
    onSuccess: async (entry, { id }) => {
      const detailIds = entry.id === id ? [id] : [id, entry.id];

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: journalEntriesQueryKey }),
        ...detailIds.map((detailId) =>
          queryClient.invalidateQueries({
            queryKey: journalEntryQueryKey(detailId),
          })
        ),
      ]);
    },
  });
}
