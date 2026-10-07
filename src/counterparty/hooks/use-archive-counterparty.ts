import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { counterpartyQueryKey } from '@/counterparty/hooks/use-counterparty';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useArchiveCounterparty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => counterpartyService.archiveCounterparty(id),
    onSuccess: async (data, id) => {
      await queryClient.cancelQueries({ queryKey: counterpartyQueryKey(id) });
      queryClient.setQueryData(counterpartyQueryKey(id), data);

      await queryClient.invalidateQueries({
        queryKey: useCounterpartiesQueryKey,
      });
    },
  });
}
