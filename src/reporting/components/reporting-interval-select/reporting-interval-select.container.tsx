import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { UIntervalSelection } from '@/shared/components/interval-select';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import reportingIntervalSelectHelpers from './helper';
import { ReportingIntervalSelect } from './reporting-interval-select';
import {
  ReportingIntervalSelectError,
  ReportingIntervalSelectSkeleton,
} from './state';
import type { ReportingIntervalSelectContainerProps } from './types';

export function ReportingIntervalSelectContainer({
  onChange,
  disabled,
  countryCode,
}: Readonly<ReportingIntervalSelectContainerProps>) {
  const { t } = useTranslation('reporting');
  const [rangeError, setRangeError] = useState(false);

  const entityId = accountingService.getAccountingEntityId();

  const fiscalYear = useQuery({
    queryKey: ['accountingService', 'getCurrentFiscalYear', entityId],
    queryFn: ({ signal }) => accountingService.getCurrentFiscalYear(signal),
    enabled: !!entityId,
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
    enabled: !!entityId && !!fiscalYearId && !fiscalYear.isError,
    throwOnError: false,
  });

  const data = interval.data;

  const handleChange = (selection: UIntervalSelection) => {
    const range = reportingIntervalSelectHelpers.toRange(selection);

    const isTooLong = reportingIntervalSelectHelpers.isTooLong(range);
    setRangeError(isTooLong);
    onChange(isTooLong ? undefined : range);
  };

  if (fiscalYear.isError || interval.isError) {
    return <ReportingIntervalSelectError />;
  }

  if (fiscalYear.isPending || interval.isPending) {
    return <ReportingIntervalSelectSkeleton />;
  }

  if (!data) {
    return null;
  }

  const range_error_text = rangeError
    ? t('interval_select_range_too_long_error')
    : undefined;

  return (
    <ReportingIntervalSelect
      interval={data}
      onChange={handleChange}
      disabled={disabled}
      countryCode={countryCode}
      error={range_error_text}
    />
  );
}
