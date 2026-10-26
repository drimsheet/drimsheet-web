import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IGetRevenueExpenseAccountsQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategoryAccounts(query: IGetRevenueExpenseAccountsQuery) {
  return useQuery({
    queryKey: ['ledgerReportingService', 'getRevenueExpenseAccounts', query],
    queryFn: ({ signal }) =>
      ledgerReportingService.getRevenueExpenseAccounts(query, signal),
  });
}
