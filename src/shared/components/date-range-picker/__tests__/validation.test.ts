import { getDateRangeError } from '@/shared/components/date-range-picker/validation';
import { describe, expect, it } from 'vitest';

const draft = { startDate: '2026-01-10', endDate: '2026-01-20' };

describe('getDateRangeError', () => {
  it('requires both dates', () => {
    expect(getDateRangeError({ startDate: '', endDate: '' })).toBe(
      'date_range_picker_incomplete_error'
    );
    expect(getDateRangeError({ ...draft, endDate: '' })).toBe(
      'date_range_picker_incomplete_error'
    );
  });

  it('rejects invalid calendar dates and reversed ranges', () => {
    expect(getDateRangeError({ ...draft, startDate: '2026-02-30' })).toBe(
      'date_range_picker_invalid_date_error'
    );
    expect(
      getDateRangeError({ startDate: draft.endDate, endDate: draft.startDate })
    ).toBe('date_range_picker_order_error');
  });

  it('allows single-day and unrestricted ranges', () => {
    expect(getDateRangeError(draft)).toBeUndefined();
    expect(
      getDateRangeError({ ...draft, endDate: draft.startDate })
    ).toBeUndefined();
  });

  it('enforces inclusive date-only boundaries independently', () => {
    expect(
      getDateRangeError(
        draft,
        new Date(2026, 0, 10, 15),
        new Date(2026, 0, 20, 15)
      )
    ).toBeUndefined();
    expect(getDateRangeError(draft, new Date(2026, 0, 11))).toBe(
      'date_range_picker_bounds_error'
    );
    expect(getDateRangeError(draft, undefined, new Date(2026, 0, 19))).toBe(
      'date_range_picker_bounds_error'
    );
  });

  it('fails closed for invalid or reversed boundaries', () => {
    expect(getDateRangeError(draft, new Date('invalid'))).toBe(
      'date_range_picker_bounds_error'
    );
    expect(getDateRangeError(draft, undefined, new Date('invalid'))).toBe(
      'date_range_picker_bounds_error'
    );
    expect(
      getDateRangeError(draft, new Date(2026, 0, 20), new Date(2026, 0, 10))
    ).toBe('date_range_picker_bounds_error');
  });
});
