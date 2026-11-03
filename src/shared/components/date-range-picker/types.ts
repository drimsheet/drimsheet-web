import type { ReactNode } from 'react';

export interface IDateRange {
  startDate: Date;
  endDate: Date;
}

export interface DateRangePickerSidePanelProps {
  value: Partial<IDateRange>;
  onChange: (value: Partial<IDateRange>) => void;
}

export interface DateRangePickerProps {
  value?: IDateRange;
  /** Emits a complete date-only range only when Apply is selected. */
  onChange: (value: IDateRange) => void;
  /** Inclusive calendar-day boundaries. */
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  countryCode?: string;
  placeholder?: string;
  triggerLabel?: string;
  ariaLabel?: string;
  id?: string;
  /** Receives the uncommitted range; changes still require Apply. */
  renderSidePanel?: (props: DateRangePickerSidePanelProps) => ReactNode;
}

export interface IDateRangeDraft {
  startDate: string;
  endDate: string;
}

export interface DateRangePickerViewProps extends DateRangePickerProps {
  numberOfMonths: 1 | 2;
}

export type UDateRangeError =
  | 'date_range_picker_incomplete_error'
  | 'date_range_picker_invalid_date_error'
  | 'date_range_picker_order_error'
  | 'date_range_picker_bounds_error';

export interface PickerPanelProps extends Pick<
  DateRangePickerProps,
  'value' | 'minDate' | 'maxDate' | 'renderSidePanel'
> {
  numberOfMonths: 1 | 2;
  onApply: (value: IDateRange) => void;
  onCancel: () => void;
}
