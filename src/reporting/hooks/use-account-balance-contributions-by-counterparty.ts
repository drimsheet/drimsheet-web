import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IGetAccountBalanceContributionsByCounterpartyQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAccountBalanceContributionsByCounterparty(
  accountId: string,
  query: IGetAccountBalanceContributionsByCounterpartyQuery
) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getAccountBalanceContributionsByCounterparty',
      accountId,
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getAccountBalanceContributionsByCounterparty(
        accountId,
        query,
        signal
      ),
  });
}
