import { useEffect, useEffectEvent, useState } from 'react';
import intervalSelectHelpers from './helper';
import { IntervalSelectView } from './interval-select';
import type { IntervalSelectProps, UIntervalSelection } from './types';

export function IntervalSelect({
  interval,
  onChange,
  ...props
}: Readonly<IntervalSelectProps>) {
  const [state, setState] = useState(() => ({
    currentPeriodOrdinal: interval?.currentPeriodOrdinal,
    selection: intervalSelectHelpers.initial(interval),
  }));

  const currentPeriodChanged =
    state.currentPeriodOrdinal !== interval?.currentPeriodOrdinal;

  const effectiveSelection = currentPeriodChanged
    ? intervalSelectHelpers.initial(interval)
    : intervalSelectHelpers.reconcile(state.selection, interval);

  const selectionKey = intervalSelectHelpers.key(state.selection);
  const effectiveKey = intervalSelectHelpers.key(effectiveSelection);

  // Adjust before committing so removed selections cannot reappear on later prop updates.
  if (currentPeriodChanged || selectionKey !== effectiveKey) {
    setState({
      currentPeriodOrdinal: interval?.currentPeriodOrdinal,
      selection: effectiveSelection,
    });
  }

  const handleChange = (selection: UIntervalSelection) => {
    setState({
      currentPeriodOrdinal: interval?.currentPeriodOrdinal,
      selection,
    });
  };

  const notifyChange = useEffectEvent(() => onChange(effectiveSelection));

  // Keep the consuming view's filter synchronized with the effective selection.
  useEffect(() => {
    notifyChange();
  }, [effectiveKey]);

  return (
    <IntervalSelectView
      {...props}
      interval={interval}
      selection={effectiveSelection}
      onChange={handleChange}
    />
  );
}
