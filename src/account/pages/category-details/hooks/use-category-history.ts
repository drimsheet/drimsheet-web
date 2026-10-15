import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategoryHistory(accountId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ledgerAccountService', 'getCategoryHistory', accountId],
    enabled,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const entries = new Map<string, IJournalEntryListDto>();
      let page = 1;
      let totalPages = 1;

      // Never show a partial page as an all-time breakdown. A reporting endpoint
      // can replace this query without changing the presentation contracts.
      while (page <= totalPages) {
        signal.throwIfAborted();

        const response = await ledgerAccountService.getTransactions(
          accountId,
          {
            page,
            limit: 100,
            orderBy: 'effectiveDate',
            sortDirection: 'desc',
          },
          signal
        );

        for (const entry of response.data) entries.set(entry.id, entry);

        totalPages = response.meta.totalPages;
        page += 1;
      }

      return [...entries.values()];
    },
  });
}
