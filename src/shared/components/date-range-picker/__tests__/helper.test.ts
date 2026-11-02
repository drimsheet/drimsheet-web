import dateRangePickerHelpers from '@/shared/components/date-range-picker/helper';
import { describe, expect, it } from 'vitest';

describe('dateRangePickerHelpers', () => {
  it('chooses a valid initial month from the value or boundaries', () => {
    const endDate = new Date(2026, 0, 20);
    expect(
      dateRangePickerHelpers.initialMonth({
        startDate: new Date('invalid'),
        endDate,
      })
    ).toEqual(endDate);
    expect(dateRangePickerHelpers.initialMonth(undefined, endDate)).toEqual(
      endDate
    );
    expect(
      dateRangePickerHelpers.initialMonth(undefined, undefined, endDate)
    ).toEqual(endDate);
    expect(dateRangePickerHelpers.initialMonth()).toBeUndefined();
  });
  it('parses calendar dates at local midnight without UTC conversion', () => {
    expect(dateRangePickerHelpers.parse('2026-01-10')).toEqual(
      new Date(2026, 0, 10)
    );
    expect(dateRangePickerHelpers.parse('2024-02-29')).toEqual(
      new Date(2024, 1, 29)
    );
  });

  it.each([
    '',
    '2026-02-30',
    '2026-13-01',
    '2026-01-00',
    '2026-02-29',
    '2026-1-1',
    'invalid',
    '0000-01-01',
  ])('rejects invalid or incomplete input %s', (input) => {
    expect(dateRangePickerHelpers.parse(input)).toBeUndefined();
  });

  it('formats draft dates and leaves missing or invalid dates empty', () => {
    expect(dateRangePickerHelpers.inputValue(new Date(2026, 0, 10, 15))).toBe(
      '2026-01-10'
    );
    expect(dateRangePickerHelpers.inputValue()).toBe('');
    expect(dateRangePickerHelpers.inputValue(new Date('invalid'))).toBe('');
  });

  it('converts complete and partial ranges to editable drafts', () => {
    expect(
      dateRangePickerHelpers.toDraft({ startDate: new Date(2026, 0, 10) })
    ).toEqual({ startDate: '2026-01-10', endDate: '' });
    expect(dateRangePickerHelpers.toDraft()).toEqual({
      startDate: '',
      endDate: '',
    });
  });

  it('converts draft fields independently', () => {
    expect(
      dateRangePickerHelpers.toRange({ startDate: '', endDate: '2026-01-20' })
    ).toEqual({ startDate: undefined, endDate: new Date(2026, 0, 20) });
  });

  it('keys a session by calendar dates and boundaries rather than object identity', () => {
    const range = {
      startDate: new Date(2026, 0, 10),
      endDate: new Date(2026, 0, 20),
    };

    expect(dateRangePickerHelpers.key(range)).toBe(
      dateRangePickerHelpers.key({
        ...range,
        startDate: new Date(2026, 0, 10, 15),
      })
    );
    expect(dateRangePickerHelpers.key(range)).not.toBe(
      dateRangePickerHelpers.key(range, new Date(2026, 0, 1))
    );
    expect(dateRangePickerHelpers.key(range)).not.toBe(
      dateRangePickerHelpers.key(range, undefined, new Date(2026, 0, 31))
    );
  });
});
