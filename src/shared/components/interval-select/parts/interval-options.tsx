import { Label } from '@/shared/components/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import intervalSelectHelpers from '../helper';
import type { IntervalOptionsProps } from '../types';

export function IntervalOptions({
  interval,
  selection,
  onChange,
}: Readonly<IntervalOptionsProps>) {
  const { t } = useTranslation('shared');
  const id = useId();

  const value =
    selection.type === 'period'
      ? `period:${selection.ordinal}`
      : selection.type;

  const interval_label = t('interval_select_label');
  const all_time_label = t('interval_select_all_time_label');
  const custom_label = t('interval_select_custom_label');

  return (
    <RadioGroup
      aria-label={interval_label}
      value={value}
      onValueChange={onChange}
      className="max-h-80 gap-1 overflow-y-auto"
    >
      {interval?.periods.map((period) => (
        <Label
          key={period.ordinal}
          htmlFor={`${id}-period-${period.ordinal}`}
          className="min-h-10 px-2 py-2"
        >
          <RadioGroupItem
            id={`${id}-period-${period.ordinal}`}
            value={`period:${period.ordinal}`}
          />
          <span className="min-w-0 break-words">{period.name}</span>
        </Label>
      ))}
      {intervalSelectHelpers.hasAllTime(interval) && (
        <Label htmlFor={`${id}-all-time`} className="min-h-10 px-2 py-2">
          <RadioGroupItem id={`${id}-all-time`} value="all-time" />
          {all_time_label}
        </Label>
      )}
      <Label htmlFor={`${id}-custom`} className="min-h-10 px-2 py-2">
        <RadioGroupItem id={`${id}-custom`} value="custom" />
        {custom_label}
      </Label>
    </RadioGroup>
  );
}
