import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type {
  ICurrentAssetAndLiabilityBalancesByCurrencyDto,
  IGetCurrentAssetAndLiabilityBalancesByCurrencyQuery,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAssetAndLiabilityBalancesByCurrency<
  TData = ICurrentAssetAndLiabilityBalancesByCurrencyDto,
>(
  query: IGetCurrentAssetAndLiabilityBalancesByCurrencyQuery,
  options?: {
    select?: (data: ICurrentAssetAndLiabilityBalancesByCurrencyDto) => TData;
  }
) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getCurrentAssetAndLiabilityBalancesByCurrency',
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getCurrentAssetAndLiabilityBalancesByCurrency(
        query,
        signal
      ),
    select: options?.select,
  });
}
