import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type {
  IAssetAndLiabilityBalancesByCurrencyDto,
  IGetAssetAndLiabilityBalancesByCurrencyQuery,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useAssetAndLiabilityBalancesByCurrency<
  TData = IAssetAndLiabilityBalancesByCurrencyDto,
>(
  query: IGetAssetAndLiabilityBalancesByCurrencyQuery,
  options?: {
    select?: (data: IAssetAndLiabilityBalancesByCurrencyDto) => TData;
  }
) {
  return useQuery({
    queryKey: [
      'ledgerReportingService',
      'getAssetAndLiabilityBalancesByCurrency',
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getAssetAndLiabilityBalancesByCurrency(
        query,
        signal
      ),
    select: options?.select,
  });
}
