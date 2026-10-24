import accountDashboardMapper from '@/account/lib/mappers/account-dashboard.mapper';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IGetLedgerAccountsQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useDashboardAccounts(query: IGetLedgerAccountsQuery) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getLedgerAccounts', query],
    queryFn: ({ signal }) =>
      ledgerAccountService.getLedgerAccounts(query, signal),
    select: accountDashboardMapper.toAccounts,
    retry: false,
  });
}
