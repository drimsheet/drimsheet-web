import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useQuery } from '@tanstack/react-query';

export function useFiscalYears(entityId: string) {
  return useQuery({
    queryKey: ['accountingService', 'getFiscalYears', entityId],
    queryFn: () => accountingService.getFiscalYears(entityId),
    enabled: !!entityId,
    throwOnError: false,
    retry: false,
  });
}
