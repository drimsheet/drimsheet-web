import { accountingService } from '@/accounting/lib/services/accounting.service';
import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import { useQuery } from '@tanstack/react-query';
import type { OverviewContainerProps } from '../types';
import { OverviewWithState } from './overview';

export function OverviewContainer({
  counterpartyId,
}: Readonly<OverviewContainerProps>) {
  const entityId = accountingService.getAccountingEntityId();

  const year = useQuery({
    queryKey: ['accountingService', 'getCurrentFiscalYear', entityId],
    queryFn: ({ signal }) => accountingService.getCurrentFiscalYear(signal),
    enabled: !!counterpartyId && !!entityId,
    throwOnError: false,
  });

  const query = { fiscalYearId: year.data?.id ?? '' };

  const participation = useQuery({
    queryKey: [
      'ledgerReportingService',
      'getCounterpartyAccountTypeParticipation',
      counterpartyId,
      query,
      entityId,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getCounterpartyAccountTypeParticipation(
        counterpartyId ?? '',
        query,
        signal
      ),
    enabled: !!counterpartyId && !!query.fiscalYearId && !year.isError,
    throwOnError: false,
  });

  const error = year.isError || participation.isError;

  return (
    <OverviewWithState
      loading={!error && (year.isPending || participation.isPending)}
      error={error}
      participation={participation.data}
    />
  );
}
