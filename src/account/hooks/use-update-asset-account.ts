import { assetAccountService } from '@/account/lib/services/asset-account.service';
import type {
  IBankAccountUpdateReq,
  ILedgerAccountDto,
  IPettyCashAccountUpdateReq,
} from '@/shared/lib/api/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useRefreshUpdatedAccount() {
  const client = useQueryClient();

  return async (account: ILedgerAccountDto) => {
    await client.cancelQueries({ queryKey: ['ledgerAccountService'] });
    client.setQueryData(
      ['ledgerAccountService', 'getLedgerAccount', account.id],
      account
    );
    await Promise.all([
      client.invalidateQueries({ queryKey: ['ledgerAccountService'] }),
      client.invalidateQueries({ queryKey: ['journalEntryService'] }),
      client.invalidateQueries({ queryKey: ['accountingBootstrapService'] }),
    ]);
  };
}

export function useUpdateBankAccount(id: string) {
  const onSuccess = useRefreshUpdatedAccount();

  return useMutation({
    mutationFn: (request: IBankAccountUpdateReq) =>
      assetAccountService.updateBankAccount(id, request),
    onSuccess,
  });
}

export function useUpdatePettyCashAccount(id: string) {
  const onSuccess = useRefreshUpdatedAccount();

  return useMutation({
    mutationFn: (request: IPettyCashAccountUpdateReq) =>
      assetAccountService.updatePettyCashAccount(id, request),
    onSuccess,
  });
}
