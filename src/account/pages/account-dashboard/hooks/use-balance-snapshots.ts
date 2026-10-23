import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useQueries } from '@tanstack/react-query';

export function useBalanceSnapshots(dates: string[], enabled: boolean) {
  return useQueries({
    queries: dates.map((date) => {
      const query = { from: date, to: date };

      return {
        queryKey: ['ledgerAccountService', 'getAssetLiabilitySummary', query],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          ledgerAccountService.getAssetLiabilitySummary(query, signal),
        enabled,
        retry: false,
      };
    }),
  });
}
