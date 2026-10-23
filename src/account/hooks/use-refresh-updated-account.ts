import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { useQueryClient } from '@tanstack/react-query';

export function useRefreshUpdatedAccount() {
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
