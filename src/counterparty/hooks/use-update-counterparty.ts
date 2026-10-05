import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { counterpartyQueryKey } from '@/counterparty/hooks/use-counterparty';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { ICounterpartyUpdateReq } from '@/shared/lib/api/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateCounterparty(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: ICounterpartyUpdateReq) =>
      counterpartyService.updateCounterparty(id, data),
    onSuccess: async (data) => {
      await client.cancelQueries({ queryKey: counterpartyQueryKey(id) });
      client.setQueryData(counterpartyQueryKey(id), data);
      client.setQueryData([...counterpartyQueryKey(id), 'update'], data);
      await Promise.all([
        client.invalidateQueries({ queryKey: useCounterpartiesQueryKey }),
        client.invalidateQueries({
          predicate: (query) =>
            (query.queryKey[0] === 'counterpartyService' &&
              query.queryKey[1] === 'getCounterpartyTransactions') ||
            (query.queryKey[0] === 'journalEntryService' &&
              query.queryKey[1] === 'getJournalEntries'),
        }),
      ]);
    },
  });
}
