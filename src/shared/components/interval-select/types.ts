import type { DateRangePickerSidePanelProps } from '@/shared/components/date-range-picker';
import type { Ref } from 'react';

export interface IPeriod {
  ordinal: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface IInterval {
  startDate?: Date;
  endDate?: Date;
  currentPeriodOrdinal?: number;
  periods: IPeriod[];
}

export type UIntervalSelection =
  | { type: 'period'; ordinal: number; startDate: Date; endDate: Date }
  | { type: 'all-time'; startDate: Date; endDate: Date }
  | { type: 'custom'; startDate?: Date; endDate?: Date };

export interface IntervalSelectProps {
  interval?: IInterval;
  /** Called on initialization, applied selection changes, and effective changes after prop updates.
   * Custom selections can be empty until a range is applied; consume a range once both dates exist.
   */
  onChange: (selection: UIntervalSelection) => void;
  disabled?: boolean;
  countryCode?: string;
}

export interface IntervalSelectViewProps extends Pick<
  IntervalSelectProps,
  'interval' | 'disabled' | 'countryCode' | 'onChange'
> {
  selection: UIntervalSelection;
}

export interface IIntervalDraftHandle {
  selection: UIntervalSelection;
}

export interface IntervalOptionsProps {
  interval?: IInterval;
  selection: UIntervalSelection;
  onChange: (option: string) => void;
}

export interface IntervalOptionsContainerProps extends DateRangePickerSidePanelProps {
  interval?: IInterval;
  selection: UIntervalSelection;
  ref: Ref<IIntervalDraftHandle>;
}
