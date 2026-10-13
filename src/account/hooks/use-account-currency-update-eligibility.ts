import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useQuery } from '@tanstack/react-query';

export function useAccountCurrencyUpdateEligibility(accountId: string) {
  return useQuery({
    queryKey: [
      'ledgerAccountService',
      'getLedgerAccountCurrencyUpdateEligibility',
      accountId,
    ],
    queryFn: () =>
      ledgerAccountService.getLedgerAccountCurrencyUpdateEligibility(accountId),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}
