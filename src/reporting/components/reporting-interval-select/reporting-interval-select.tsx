import reportingIntervalMapper from '@/reporting/lib/mappers/reporting-interval.mapper';
import { IntervalSelect } from '@/shared/components/interval-select';
import type { ReportingIntervalSelectProps } from './types';

export function ReportingIntervalSelect({
  interval,
  onChange,
  disabled,
  countryCode,
}: Readonly<ReportingIntervalSelectProps>) {
  const mappedInterval = interval
    ? reportingIntervalMapper.toInterval(interval)
    : undefined;

  const intervalKey = interval
    ? `${interval.accountingEntityId}:${interval.fiscalYearId}:${interval.id}`
    : 'unscoped';

  return (
    <IntervalSelect
      key={intervalKey}
      interval={mappedInterval}
      onChange={onChange}
      disabled={disabled}
      countryCode={countryCode}
    />
  );
}
