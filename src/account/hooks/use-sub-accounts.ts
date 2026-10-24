import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useQuery } from '@tanstack/react-query';

export function useSubAccounts(accountId: string) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getSubAccounts', accountId],
    queryFn: () => ledgerAccountService.getSubAccounts(accountId),
  });
}
