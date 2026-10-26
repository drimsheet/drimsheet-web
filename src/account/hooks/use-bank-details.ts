import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { parseApiError } from '@/shared/lib/api';
import { useQuery } from '@tanstack/react-query';

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
        ) {
          return null;
        }

        throw error;
      }
    },
  });
}
