import { assetAccountService } from '@/account/lib/services/asset-account.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetAccountService.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ledgerAccountService', 'getLedgerAccounts'],
      });
    },
  });
}
