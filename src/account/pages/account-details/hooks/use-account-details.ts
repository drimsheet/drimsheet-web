import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { parseApiError } from '@/shared/lib/api';
import type {
  IGetAccountCashFlowQuery,
  IGetJournalEntriesQuery,
} from '@/shared/lib/api/Api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useBankDetails(accountId: string) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getBankDetails', accountId],
    queryFn: async () => {
      try {
        return await ledgerAccountService.getBankDetails(accountId);
      } catch (error) {
        if (
          parseApiError(error).errorKey ===
          'ledger_error_bank_details_missing_unexpected'
        )
          return null;

        throw error;
      }
    },
  });
}

export function useSubAccounts(accountId: string) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getSubAccounts', accountId],
    queryFn: () => ledgerAccountService.getSubAccounts(accountId),
  });
}

export function useAccountCashFlow(
  accountId: string,
  query: IGetAccountCashFlowQuery
) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getAccountCashFlow', accountId, query],
    queryFn: () => ledgerAccountService.getAccountCashFlow(accountId, query),
  });
}

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
