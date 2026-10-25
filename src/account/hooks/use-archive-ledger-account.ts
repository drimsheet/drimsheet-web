import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useArchiveLedgerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ledgerAccountService.archiveLedgerAccount(id),
    onSuccess: async (_data, id) => {
      const queryKey = ['ledgerAccountService'];
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({
        queryKey: ['reportingService'],
      });
      queryClient.setQueryData<ILedgerAccountDto>(
        [...queryKey, 'getLedgerAccount', id],
        (account) => account && { ...account, status: 'archived' }
      );

      // Control accounts archive descendants too; refresh details, lists,
      // sub-accounts and permitted posting selectors together.
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({
        queryKey: ['reportingService'],
      });
    },
  });
}
