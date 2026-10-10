import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const counterpartyDeletionEligibilityQueryKey = (
  id: string | undefined
) => ['counterpartyService', 'getCounterpartyDeletionEligibility', id] as const;

const getQueryOptions = (id: string | undefined) => ({
  queryKey: counterpartyDeletionEligibilityQueryKey(id),
  queryFn: () => counterpartyService.getCounterpartyDeletionEligibility(id!),
  retry: false,
});

export function useCounterpartyDeletionEligibility(
  id: string | undefined,
  enabled: boolean
) {
  return useQuery({
    ...getQueryOptions(id),
    enabled: enabled && Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}

export function useCheckCounterpartyDeletionEligibility() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) =>
      queryClient.fetchQuery({
        ...getQueryOptions(id),
        staleTime: 0,
      }),
    [queryClient]
  );
}
