import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useQuery } from '@tanstack/react-query';

export function useAccountingContexts(entityId: string | undefined) {
  return useQuery({
    queryKey: ['accountingService', 'getAccountingContexts', entityId],
    queryFn: () => accountingService.getAccountingContexts(),
    enabled: !!entityId,
    throwOnError: false,
  });
}
