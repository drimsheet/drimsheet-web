import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useQuery } from '@tanstack/react-query';

export function useEntityDetails(entityId: string) {
  return useQuery({
    queryKey: ['accountingService', 'getEntityDetails', entityId],
    queryFn: () => accountingService.getEntityDetails(entityId),
    enabled: !!entityId,
    throwOnError: false,
    retry: false,
  });
}
