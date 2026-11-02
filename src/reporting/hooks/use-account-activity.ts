import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IGetAccountActivityQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAccountActivity(
  accountId: string,
  query: IGetAccountActivityQuery,
  enabled = true
) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getAccountActivity',
      accountId,
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getAccountActivity(accountId, query, signal),
    enabled,
  });
}
