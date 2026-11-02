import { Button } from '@/shared/components/button';
import { Calendar } from '@/shared/components/calendar';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { useId, useState, type ChangeEvent } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import dateRangePickerHelpers from '../helper';
import type { IDateRange, PickerPanelProps } from '../types';
import { getDateRangeError } from '../validation';

export function PickerPanel({
  value,
  minDate,
  maxDate,
  onApply,
  onCancel,
  renderSidePanel,
  numberOfMonths,
}: Readonly<PickerPanelProps>) {
  const { t } = useTranslation('shared');
  const id = useId();

  const [draft, setDraft] = useState(() =>
    dateRangePickerHelpers.toDraft(value)
  );

  const [month, setMonth] = useState(() =>
    dateRangePickerHelpers.initialMonth(value, minDate, maxDate)
  );

  const range = dateRangePickerHelpers.toRange(draft);
  const error = getDateRangeError(draft, minDate, maxDate);

  const disabledDates = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const selectedRange =
    !range.startDate ||
    (error && error !== 'date_range_picker_incomplete_error')
      ? undefined
      : { from: range.startDate, to: range.endDate };

  const handleStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    const startDate = event.target.value;
    setDraft({ ...draft, startDate });
    const date = dateRangePickerHelpers.parse(startDate);
    if (date) {
      setMonth(date);
    }
  };

  const handleEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    const endDate = event.target.value;
    setDraft({ ...draft, endDate });
    const date = dateRangePickerHelpers.parse(endDate);
    if (date) {
      setMonth(date);
    }
  };

  const handleCalendarChange = (selected: DateRange | undefined) => {
    setDraft(
      dateRangePickerHelpers.toDraft({
        startDate: selected?.from,
        endDate: selected?.to,
      })
    );
  };

  const handleSidePanelChange = (selected: Partial<IDateRange>) => {
    setDraft(dateRangePickerHelpers.toDraft(selected));
    setMonth(dateRangePickerHelpers.initialMonth(selected, minDate, maxDate));
  };

  const handleApply = () => {
    if (!error && range.startDate && range.endDate) {
      onApply({ startDate: range.startDate, endDate: range.endDate });
    }
  };

  const start_label = t('date_range_picker_start_label');
  const end_label = t('date_range_picker_end_label');
  const cancel_label = t('cancel');
  const apply_label = t('date_range_picker_apply_label');

  const error_text =
    error && error !== 'date_range_picker_incomplete_error'
      ? t(error)
      : undefined;

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="min-w-0">
          <FieldGroup className="flex-row gap-2 px-3 pt-3">
            <Field data-invalid={Boolean(error_text)}>
              <FieldLabel htmlFor={`${id}-start`}>{start_label}</FieldLabel>
              <Input
                id={`${id}-start`}
                type="text"
                autoComplete="off"
                maxLength={10}
                value={draft.startDate}
                placeholder="YYYY-MM-DD"
                onChange={handleStartChange}
                aria-invalid={Boolean(error_text)}
                aria-describedby={error_text ? `${id}-error` : undefined}
              />
            </Field>
            <Field data-invalid={Boolean(error_text)}>
              <FieldLabel htmlFor={`${id}-end`}>{end_label}</FieldLabel>
              <Input
                id={`${id}-end`}
                type="text"
                autoComplete="off"
                maxLength={10}
                value={draft.endDate}
                placeholder="YYYY-MM-DD"
                onChange={handleEndChange}
                aria-invalid={Boolean(error_text)}
                aria-describedby={error_text ? `${id}-error` : undefined}
              />
            </Field>
          </FieldGroup>
          <FieldError id={`${id}-error`} className="px-3 pt-2">
            {error_text}
          </FieldError>
          <Calendar
            mode="range"
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={numberOfMonths}
            showOutsideDays={false}
            selected={selectedRange}
            onSelect={handleCalendarChange}
            disabled={disabledDates}
            excludeDisabled
            className="[&_[data-range-middle=true]]:bg-accent"
            classNames={{
              range_start:
                'relative isolate z-0 rounded-l-(--cell-radius) bg-accent after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-accent',
              range_middle: 'rounded-none bg-accent',
              range_end:
                'relative isolate z-0 rounded-r-(--cell-radius) bg-accent after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-accent',
            }}
          />
        </div>
        {renderSidePanel && (
          <div className="order-first flex flex-col gap-1 border-b p-3 md:order-last md:w-44 md:shrink-0 md:border-b-0 md:border-l">
            {renderSidePanel({ value: range, onChange: handleSidePanelChange })}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t p-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {cancel_label}
        </Button>
        <Button type="button" disabled={Boolean(error)} onClick={handleApply}>
          {apply_label}
        </Button>
      </div>
    </>
  );
}
