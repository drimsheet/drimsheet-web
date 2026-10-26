import { reportingService } from '@/reporting/lib/services/reporting.service';
import type { IGetAccountCashFlowQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAccountCashFlow(
  accountId: string,
  query: IGetAccountCashFlowQuery
) {
  return useQuery({
    queryKey: ['reportingService', 'getAccountCashFlow', accountId, query],
    queryFn: () => reportingService.getAccountCashFlow(accountId, query),
  });
}
