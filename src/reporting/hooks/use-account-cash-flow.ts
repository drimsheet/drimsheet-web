import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IGetAccountCashFlowQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAccountCashFlow(
  accountId: string,
  query: IGetAccountCashFlowQuery
) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getAccountCashFlow',
      accountId,
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getAccountCashFlow(accountId, query, signal),
  });
}
