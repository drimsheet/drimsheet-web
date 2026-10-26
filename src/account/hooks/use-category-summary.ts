import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategorySummary(query: IDateRangeDto) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getRevenueAndExpenseActivitySummary',
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getRevenueAndExpenseActivitySummary(query, signal),
  });
}
