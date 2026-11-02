import { useSyncExternalStore } from 'react';
import { DateRangePickerView } from './date-range-picker';
import type { DateRangePickerProps } from './types';

const mobileQuery = '(max-width: 767px)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
}

function isMobile() {
  return window.matchMedia(mobileQuery).matches;
}

function serverSnapshot() {
  return false;
}

export function DateRangePicker(props: Readonly<DateRangePickerProps>) {
  const mobile = useSyncExternalStore(subscribe, isMobile, serverSnapshot);

  return <DateRangePickerView {...props} numberOfMonths={mobile ? 1 : 2} />;
}
