import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IGetJournalEntriesQuery } from '@/shared/lib/api/Api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useAccountTransactions(
  accountId: string,
  query: IGetJournalEntriesQuery
) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getTransactions', accountId, query],
    queryFn: () => ledgerAccountService.getTransactions(accountId, query),
    placeholderData: keepPreviousData,
  });
}
