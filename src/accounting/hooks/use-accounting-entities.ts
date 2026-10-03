import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { IReactQueryOptions } from '@/shared/types/query-options.types';
import { useQuery } from '@tanstack/react-query';

export function useAccountingEntities(options: IReactQueryOptions = {}) {
  return useQuery({
    queryKey: ['accountingService', 'getAccountingEntities'],
    queryFn: () => accountingService.getAccountingEntities(),
    enabled: !options.disabled,
    // Initial failures belong to the app boundary; refresh failures remain retryable.
    throwOnError:
      options.throwOnError ??
      ((_error, query) => query.state.data === undefined),
  });
}
