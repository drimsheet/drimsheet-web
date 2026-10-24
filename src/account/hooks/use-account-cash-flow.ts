import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IGetAccountCashFlowQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAccountCashFlow(
  accountId: string,
  query: IGetAccountCashFlowQuery
) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getAccountCashFlow', accountId, query],
    queryFn: () => ledgerAccountService.getAccountCashFlow(accountId, query),
  });
}
