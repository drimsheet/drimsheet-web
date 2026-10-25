import { reportingService } from '@/reporting/lib/services/reporting.service';
import type {
  IGetLedgerBalancesByCurrencyQuery,
  ILedgerBalancesByCurrencyDto,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useLedgerBalancesByCurrency<
  TData = ILedgerBalancesByCurrencyDto,
>(
  query: IGetLedgerBalancesByCurrencyQuery,
  options?: {
    select?: (data: ILedgerBalancesByCurrencyDto) => TData;
  }
) {
  return useQuery({
    queryKey: ['reportingService', 'getLedgerBalancesByCurrency', query],
    queryFn: ({ signal }) =>
      reportingService.getLedgerBalancesByCurrency(query, signal),
    select: options?.select,
  });
}
