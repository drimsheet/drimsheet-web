import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
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
    queryKey: ['ledgerReportingService', 'getBalancesBySubType', query],
    queryFn: ({ signal }) =>
      ledgerReportingService.getBalancesBySubType(query, signal),
    select: options?.select,
  });
}
