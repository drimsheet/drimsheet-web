import { reportingService } from '@/reporting/lib/services/reporting.service';
import type {
  IBalancesBySubTypeDto,
  IGetBalancesBySubTypeQuery,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useBalancesBySubType<TData = IBalancesBySubTypeDto>(
  query: IGetBalancesBySubTypeQuery,
  options?: {
    select?: (data: IBalancesBySubTypeDto) => TData;
  }
) {
  return useQuery({
    queryKey: ['reportingService', 'getBalancesBySubType', query],
    queryFn: ({ signal }) =>
      reportingService.getBalancesBySubType(query, signal),
    select: options?.select,
  });
}
