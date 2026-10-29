import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IGetRevenueExpenseAndSuspenseAccountBalancesQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategoryAccounts(
  query: IGetRevenueExpenseAndSuspenseAccountBalancesQuery
) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getRevenueExpenseAndSuspenseAccountBalances',
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getRevenueExpenseAndSuspenseAccountBalances(
        query,
        signal
      ),
  });
}
