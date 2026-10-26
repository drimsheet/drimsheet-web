import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteLedgerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ledgerAccountService.deleteLedgerAccount(id),
    onSuccess: async (_data, id) => {
      await queryClient.cancelQueries({ queryKey: ['ledgerAccountService'] });
      await queryClient.cancelQueries({
        queryKey: ['journalEntryService', 'getJournalEntries'],
      });
      await queryClient.cancelQueries({
        queryKey: ['reportingService'],
      });
      queryClient.removeQueries({
        queryKey: ['ledgerAccountService'],
        predicate: (query) => query.queryKey[2] === id,
      });

      queryClient.removeQueries({
        queryKey: ['reportingService', 'getAccountCashFlow', id],
      });

      queryClient.removeQueries({
        queryKey: [
          'journalEntryService',
          'getJournalEntries',
          { accountId: id },
        ],
      });

      // Deletion can remove descendants and draft journals. Mark related data
      // stale without refetching the deleted account before navigation.
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['reportingService'],
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({
          queryKey: ['ledgerAccountService'],
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({
          queryKey: ['journalEntryService'],
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({
          queryKey: ['accountingBootstrapService'],
          refetchType: 'none',
        }),
      ]);
    },
  });
}
