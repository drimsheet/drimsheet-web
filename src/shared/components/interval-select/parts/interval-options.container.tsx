import { useImperativeHandle, useState } from 'react';
import intervalSelectHelpers from '../helper';
import type { IntervalOptionsContainerProps } from '../types';
import { IntervalOptions } from './interval-options';

export function IntervalOptionsContainer({
  interval,
  selection,
  value,
  onChange,
  ref,
}: Readonly<IntervalOptionsContainerProps>) {
  const [draftSelection, setDraftSelection] = useState(selection);

  const effectiveSelection = intervalSelectHelpers.withRange(
    draftSelection,
    value
  );

  if (
    intervalSelectHelpers.key(draftSelection) !==
    intervalSelectHelpers.key(effectiveSelection)
  ) {
    setDraftSelection(effectiveSelection);
  }

  // The slot shares its draft type with Apply; unmounting on dismissal clears the handle.
  useImperativeHandle(ref, () => ({ selection: effectiveSelection }), [
    effectiveSelection,
  ]);

  const handleOptionChange = (option: string) => {
    if (option === 'custom') {
      setDraftSelection({
        type: 'custom',
        startDate: value.startDate,
        endDate: value.endDate,
      });

      return;
    }

    const next = intervalSelectHelpers.fromOption(option, interval);
    setDraftSelection(next);
    onChange({ startDate: next.startDate, endDate: next.endDate });
  };

  return (
    <IntervalOptions
      interval={interval}
      selection={effectiveSelection}
      onChange={handleOptionChange}
    />
  );
}
