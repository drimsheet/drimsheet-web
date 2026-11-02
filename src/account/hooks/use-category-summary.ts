import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import { useQuery } from '@tanstack/react-query';

export function useCategorySummary() {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getRevenueExpenseAndSuspenseAccountBalances',
      'totals',
    ],
    queryFn: async ({ signal }) => {
      const first =
        await ledgerReportingService.getRevenueExpenseAndSuspenseAccountBalances(
          { page: 1, limit: 100 },
          signal
        );

      const accounts = [...first.data];

      for (let page = 2; page <= first.meta.totalPages; page += 1) {
        const result =
          await ledgerReportingService.getRevenueExpenseAndSuspenseAccountBalances(
            { page, limit: 100 },
            signal
          );

        accounts.push(...result.data);
      }

      return accounts;
    },
  });
}
