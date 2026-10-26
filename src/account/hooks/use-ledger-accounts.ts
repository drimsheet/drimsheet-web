import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type {
  IGetLedgerAccountsQuery,
  IPaginatedResponseILedgerAccountDto,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useLedgerAccounts<TData = IPaginatedResponseILedgerAccountDto>(
  query: IGetLedgerAccountsQuery,
  options?: {
    select?: (data: IPaginatedResponseILedgerAccountDto) => TData;
  }
) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getLedgerAccounts', query],
    queryFn: ({ signal }) =>
      ledgerAccountService.getLedgerAccounts(query, signal),
    select: options?.select,
  });
}
