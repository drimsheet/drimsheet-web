import { Button } from '@/shared/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { dateUtils } from '@/shared/lib/utils/date';
import { Calendar1, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dateRangePickerHelpers from './helper';
import { PickerPanel } from './parts/picker-panel';
import type { DateRangePickerViewProps, IDateRange } from './types';
import { getDateRangeError } from './validation';

export function DateRangePickerView({
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  countryCode,
  placeholder,
  triggerLabel,
  ariaLabel,
  id,
  renderSidePanel,
  numberOfMonths,
}: Readonly<DateRangePickerViewProps>) {
  const { t } = useTranslation('shared');
  const descriptionId = useId();
  const [open, setOpen] = useState(false);

  if (disabled && open) {
    setOpen(false);
  }

  const hasValidValue =
    value &&
    !getDateRangeError(dateRangePickerHelpers.toDraft(value), minDate, maxDate);

  const handleApply = (range: IDateRange) => {
    onChange(range);
    setOpen(false);
  };

  const range_label = ariaLabel ?? t('date_range_picker_label');
  const range_placeholder = placeholder ?? t('date_range_picker_placeholder');

  const range_text = hasValidValue
    ? t('date_range_picker_value', {
        start: dateUtils.formatWithJurisdiction(value.startDate, countryCode),
        end: dateUtils.formatWithJurisdiction(value.endDate, countryCode),
      })
    : range_placeholder;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={range_label}
          aria-describedby={descriptionId}
        >
          <Calendar1 data-icon="inline-start" />
          <span id={descriptionId}>{triggerLabel ?? range_text}</span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={range_label}
        align="start"
        className="max-h-(--radix-popover-content-available-height) w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto p-0"
      >
        <PickerPanel
          key={dateRangePickerHelpers.key(value, minDate, maxDate)}
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          renderSidePanel={renderSidePanel}
          numberOfMonths={numberOfMonths}
          onApply={handleApply}
          onCancel={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
