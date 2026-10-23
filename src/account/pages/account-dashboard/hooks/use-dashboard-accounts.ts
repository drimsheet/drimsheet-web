import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IGetAssetLiabilityAccountParticipationQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useDashboardAccounts(
  query: IGetAssetLiabilityAccountParticipationQuery
) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getAssetLiabilityAccounts', query],
    queryFn: ({ signal }) =>
      ledgerAccountService.getAssetLiabilityAccounts(query, signal),
    retry: false,
  });
}
