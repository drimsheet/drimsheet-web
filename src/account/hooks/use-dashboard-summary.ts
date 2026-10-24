import accountDashboardMapper from '@/account/lib/mappers/account-dashboard.mapper';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IGetLedgerBalancesByCurrencyQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useDashboardSummary() {
  const query: IGetLedgerBalancesByCurrencyQuery = { type: 'asset' };

  return useQuery({
    queryKey: ['ledgerAccountService', 'getLedgerBalancesByCurrency', query],
    queryFn: ({ signal }) =>
      ledgerAccountService.getLedgerBalancesByCurrency(query, signal),
    select: accountDashboardMapper.toSummary,
    retry: false,
  });
}
