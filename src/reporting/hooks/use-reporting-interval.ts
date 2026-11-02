import { accountingService } from '@/accounting/lib/services/accounting.service';
import reportingIntervalMapper from '@/reporting/lib/mappers/reporting-interval.mapper';
import reportingIntervalUtils from '@/reporting/lib/utils/reporting-interval';
import type { UIntervalSelection } from '@/shared/components/interval-select';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function useReportingInterval(enabled = true) {
  const [applied, setApplied] = useState<{
    scope: string;
    selection: UIntervalSelection;
  }>();

  const entityId = accountingService.getAccountingEntityId();

  const fiscalYear = useQuery({
    queryKey: ['accountingService', 'getCurrentFiscalYear', entityId],
    queryFn: ({ signal }) => accountingService.getCurrentFiscalYear(signal),
    enabled: enabled && !!entityId,
    throwOnError: false,
  });

  const fiscalYearId = fiscalYear.data?.id ?? '';

  const interval = useQuery({
    queryKey: [
      'accountingService',
      'getReportingInterval',
      fiscalYearId,
      entityId,
    ],
    queryFn: ({ signal }) =>
      accountingService.getReportingInterval(fiscalYearId, signal),
    enabled: enabled && !!entityId && !!fiscalYearId && !fiscalYear.isError,
    throwOnError: false,
  });

  const data = interval.data;

  const scope = data
    ? `${entityId}:${fiscalYearId}:${data.id}:${data.currentPeriodOrdinal}`
    : '';

  const selection = applied?.scope === scope ? applied.selection : undefined;

  const mappedInterval = data
    ? reportingIntervalMapper.toInterval(data)
    : undefined;

  const selectedRange = reportingIntervalUtils.toRange(
    selection,
    mappedInterval
  );

  const isRangeTooLong = reportingIntervalUtils.isTooLong(selectedRange);
  const isError = fiscalYear.isError || interval.isError;

  const handleChange = (next: UIntervalSelection) => {
    setApplied({ scope, selection: next });
  };

  return {
    interval: data,
    range: isRangeTooLong || isError ? undefined : selectedRange,
    onChange: handleChange,
    isRangeTooLong,
    bucketDays: reportingIntervalUtils.bucketDays(selectedRange),
    isError,
    isPending:
      enabled && !isError && (fiscalYear.isPending || interval.isPending),
  };
}
