import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useDashboardSummary(query: IDateRangeDto) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getAssetLiabilitySummary', query],
    queryFn: ({ signal }) =>
      ledgerAccountService.getAssetLiabilitySummary(query, signal),
    retry: false,
  });
}
