import { counterpartyDeletionEligibilityQueryOptions } from '@/counterparty/lib/configs/counterparty-deletion-eligibility-query';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useCheckCounterpartyDeletionEligibility() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) =>
      queryClient.fetchQuery({
        ...counterpartyDeletionEligibilityQueryOptions(id),
        staleTime: 0,
      }),
    [queryClient]
  );
}
