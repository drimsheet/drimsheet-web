import {
  DateRangePicker,
  type DateRangePickerSidePanelProps,
  type IDateRange,
} from '@/shared/components/date-range-picker';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import intervalSelectHelpers from './helper';
import { IntervalOptionsContainer } from './parts/interval-options.container';
import type { IIntervalDraftHandle, IntervalSelectViewProps } from './types';

export function IntervalSelectView({
  interval,
  selection,
  onChange,
  disabled,
  countryCode,
}: Readonly<IntervalSelectViewProps>) {
  const { t } = useTranslation('shared');
  const draftRef = useRef<IIntervalDraftHandle>(null);

  const range =
    selection.startDate && selection.endDate
      ? { startDate: selection.startDate, endDate: selection.endDate }
      : undefined;

  const selectedPeriod =
    selection.type === 'period'
      ? interval?.periods.find((period) => period.ordinal === selection.ordinal)
      : undefined;

  const handleApply = (value: IDateRange) => {
    onChange(
      intervalSelectHelpers.withRange(
        draftRef.current?.selection ?? selection,
        value
      )
    );
  };

  const renderSidePanel = (props: DateRangePickerSidePanelProps) => (
    <IntervalOptionsContainer
      {...props}
      ref={draftRef}
      interval={interval}
      selection={selection}
    />
  );

  const interval_label = t('interval_select_label');
  const all_time_label = t('interval_select_all_time_label');
  const range_placeholder = t('interval_select_range_placeholder');

  const trigger_label =
    selection.type === 'all-time' ? all_time_label : selectedPeriod?.name;

  return (
    <DateRangePicker
      key={intervalSelectHelpers.pickerKey(selection, interval)}
      value={range}
      onChange={handleApply}
      minDate={interval?.startDate}
      maxDate={interval?.endDate}
      disabled={disabled}
      countryCode={countryCode}
      ariaLabel={interval_label}
      placeholder={range_placeholder}
      triggerLabel={trigger_label}
      renderSidePanel={renderSidePanel}
    />
  );
}
