import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useQuery } from '@tanstack/react-query';

export function useFiscalYearContext(entityId: string, yearId: string) {
  return useQuery({
    queryKey: ['accountingService', 'getFiscalYearContext', entityId, yearId],
    queryFn: () => accountingService.getFiscalYearContext(entityId, yearId),
    enabled: !!entityId && !!yearId,
    throwOnError: false,
    retry: false,
  });
}
