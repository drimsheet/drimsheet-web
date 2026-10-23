import { counterpartyDeletionEligibilityQueryOptions } from '@/counterparty/lib/configs/counterparty-deletion-eligibility-query';
import { useQuery } from '@tanstack/react-query';

export function useCounterpartyDeletionEligibility(
  id: string | undefined,
  enabled: boolean
) {
  return useQuery({
    ...counterpartyDeletionEligibilityQueryOptions(id),
    enabled: enabled && Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}
