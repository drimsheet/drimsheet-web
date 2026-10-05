import { assetAccountService } from '@/account/lib/services/asset-account.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePettyCashAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetAccountService.createPettyCashAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ledgerAccountService', 'getLedgerAccounts'],
      });
    },
  });
}
