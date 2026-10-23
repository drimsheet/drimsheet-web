import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useAccountBreakdown(type: 'asset' | 'liability') {
  const query = { type, limit: 20 };

  return useInfiniteQuery({
    queryKey: [
      'ledgerAccountService',
      'getAssetLiabilityAccounts',
      query,
      'infinite',
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      ledgerAccountService.getAssetLiabilityAccounts(
        { ...query, page: pageParam },
        signal
      ),
    getNextPageParam: ({ meta }) =>
      meta.page < meta.totalPages ? meta.page + 1 : undefined,
    retry: false,
  });
}
