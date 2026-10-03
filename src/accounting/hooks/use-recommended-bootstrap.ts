import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { IReactQueryOptions } from '@/shared/types/query-options.types';
import { useQuery } from '@tanstack/react-query';

export function useRecommendedBootstrap(options: IReactQueryOptions = {}) {
  return useQuery({
    queryKey: ['accountingBootstrapService', 'getRecommendations'],
    queryFn: () => accountingBootstrapService.getRecommendations(),
    enabled: !options.disabled,
    throwOnError: options.throwOnError,
    retry: false,
  });
}
