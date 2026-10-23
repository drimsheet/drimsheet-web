import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { counterpartyQueryKey } from '@/counterparty/hooks/use-counterparty';
import { counterpartyDeletionEligibilityQueryKey } from '@/counterparty/lib/configs/counterparty-deletion-eligibility-query';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteCounterparty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => counterpartyService.deleteCounterparty(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: counterpartyQueryKey(id) });
      queryClient.removeQueries({
        queryKey: counterpartyDeletionEligibilityQueryKey(id),
      });

      await queryClient.invalidateQueries({
        queryKey: useCounterpartiesQueryKey,
      });
    },
  });
}
