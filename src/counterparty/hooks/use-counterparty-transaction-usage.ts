import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { useQueries } from '@tanstack/react-query';

export function useCounterpartyTransactionUsage(id: string | undefined) {
  const queries = useQueries({
    queries: (['posted', 'archived'] as const).map((status) => ({
      queryKey: ['counterpartyService', 'transactionUsage', id, status],
      queryFn: () =>
        counterpartyService.getCounterpartyTransactions({
          counterpartyId: id,
          status,
          page: 1,
          limit: 1,
        }),
      enabled: Boolean(id),
      retry: false,
      throwOnError: true,
      refetchOnMount: 'always' as const,
      refetchOnWindowFocus: false,
    })),
  });

  const used = queries.some((query) =>
    Boolean(
      query.data && (query.data.meta.total > 0 || query.data.data.length > 0)
    )
  );

  const failed = queries.some((query) => query.isError);

  const checking =
    Boolean(id) &&
    queries.some((query) => query.isFetching || !query.isFetchedAfterMount);

  return {
    used,
    failed,
    checking,
    canChangeType:
      !used &&
      !failed &&
      !checking &&
      queries.every((query) => query.isSuccess),
  };
}
