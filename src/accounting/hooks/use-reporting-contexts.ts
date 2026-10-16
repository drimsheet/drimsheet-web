import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useQuery } from '@tanstack/react-query';

export function useReportingContexts(entityId: string | undefined) {
  return useQuery({
    queryKey: ['accountingService', 'getReportingContexts', entityId],
    queryFn: () => accountingService.getReportingContexts(),
    enabled: !!entityId,
    throwOnError: false,
  });
}
