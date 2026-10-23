import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';

export const counterpartyDeletionEligibilityQueryKey = (
  id: string | undefined
) => ['counterpartyService', 'getCounterpartyDeletionEligibility', id] as const;

export const counterpartyDeletionEligibilityQueryOptions = (
  id: string | undefined
) => ({
  queryKey: counterpartyDeletionEligibilityQueryKey(id),
  queryFn: () => counterpartyService.getCounterpartyDeletionEligibility(id!),
  retry: false,
});
