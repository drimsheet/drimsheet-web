import type { IntervalSelectProps } from '@/shared/components/interval-select';
import type { IReportingInterval } from '@/shared/lib/api/Api';

export interface ReportingIntervalSelectProps extends Pick<
  IntervalSelectProps,
  'onChange' | 'disabled' | 'countryCode'
> {
  /** API dates use UTC instants with exclusive ends; the callback emits inclusive local calendar dates. */
  interval?: IReportingInterval | null;
}
