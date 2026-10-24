import accountDashboardMapper from '@/account/lib/mappers/account-dashboard.mapper';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IGetBalancesBySubTypeQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useDashboardBalanceHistory(query: IGetBalancesBySubTypeQuery) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getBalancesBySubType', query],
    queryFn: ({ signal }) =>
      ledgerAccountService.getBalancesBySubType(query, signal),
    select: accountDashboardMapper.toHistory,
    retry: false,
  });
}
