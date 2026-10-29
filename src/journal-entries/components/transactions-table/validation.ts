import type { IJournalEntryTableFilters } from './types';

export function hasInvalidFilterDates(
  value: IJournalEntryTableFilters
): boolean {
  return Boolean(
    (value.effectiveDateFrom &&
      value.effectiveDateTo &&
      value.effectiveDateFrom > value.effectiveDateTo) ||
    (value.recordedDateFrom &&
      value.recordedDateTo &&
      value.recordedDateFrom > value.recordedDateTo)
  );
}
