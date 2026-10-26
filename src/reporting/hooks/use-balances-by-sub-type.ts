import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type {
  IBalanceHistoryBySubTypeDto,
  IGetBalanceHistoryBySubTypeQuery,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useBalancesBySubType<TData = IBalanceHistoryBySubTypeDto>(
  query: IGetBalanceHistoryBySubTypeQuery,
  options?: {
    select?: (data: IBalanceHistoryBySubTypeDto) => TData;
  }
) {
  return useQuery({
    queryKey: ['ledgerReportingService', 'getBalanceHistoryBySubType', query],
    queryFn: ({ signal }) =>
      ledgerReportingService.getBalanceHistoryBySubType(query, signal),
    select: options?.select,
  });
}
