import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useQuery } from '@tanstack/react-query';

export function useLedgerAccountDeletionEligibility(
  id: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: [
      'ledgerAccountService',
      'getLedgerAccountDeletionEligibility',
      id,
    ],
    queryFn: () => ledgerAccountService.getLedgerAccountDeletionEligibility(id),
    enabled: enabled && Boolean(id),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}
