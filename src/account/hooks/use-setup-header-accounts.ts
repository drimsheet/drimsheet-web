import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IHeaderAccountNameAliasesReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useSetupHeaderAccounts() {
  return useMutation({
    mutationFn: (payload: IHeaderAccountNameAliasesReq) =>
      ledgerAccountService.setupHeaderAccounts(payload),
    retry: false,
  });
}
