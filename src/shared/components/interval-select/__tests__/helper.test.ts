import type { IInterval } from '@/shared/components/interval-select';
import intervalSelectHelpers from '@/shared/components/interval-select/helper';
import { describe, expect, it } from 'vitest';

const startDate = new Date(2026, 0, 1);
const endDate = new Date(2026, 0, 31);
const period = { ordinal: 0, name: 'January', startDate, endDate };

const interval: IInterval = {
  startDate,
  endDate,
  periods: [period],
  currentPeriodOrdinal: 0,
};

describe('intervalSelectHelpers', () => {
  it('requires both boundaries for all time', () => {
    expect(intervalSelectHelpers.hasAllTime(interval)).toBe(true);
    expect(intervalSelectHelpers.hasAllTime({ periods: [], startDate })).toBe(
      false
    );
    expect(intervalSelectHelpers.hasAllTime({ periods: [], endDate })).toBe(
      false
    );
    expect(intervalSelectHelpers.hasAllTime()).toBe(false);
  });

  it('initializes ordinal zero as a period', () => {
    expect(intervalSelectHelpers.initial(interval)).toEqual({
      type: 'period',
      ordinal: 0,
      startDate,
      endDate,
    });
  });

  it.each([undefined, 99])(
    'falls back to all time for current ordinal %s',
    (currentPeriodOrdinal) => {
      expect(
        intervalSelectHelpers.initial({ ...interval, currentPeriodOrdinal })
      ).toEqual({ type: 'all-time', startDate, endDate });
    }
  );

  it('falls back to custom without a complete interval', () => {
    expect(intervalSelectHelpers.initial()).toEqual({ type: 'custom' });
    expect(intervalSelectHelpers.initial({ periods: [] })).toEqual({
      type: 'custom',
    });
    expect(
      intervalSelectHelpers.initial({ periods: [period], endDate })
    ).toEqual({ type: 'custom' });
  });

  it('resolves explicit options independently of period names', () => {
    expect(intervalSelectHelpers.fromOption('period:0', interval)).toEqual({
      type: 'period',
      ordinal: 0,
      startDate,
      endDate,
    });
    expect(intervalSelectHelpers.fromOption('all-time', interval)).toEqual({
      type: 'all-time',
      startDate,
      endDate,
    });
    expect(intervalSelectHelpers.fromOption('period:99', interval)).toEqual({
      type: 'custom',
    });
    expect(intervalSelectHelpers.fromOption('custom', interval)).toEqual({
      type: 'custom',
    });
  });

  it('supports single-day and incomplete custom ranges', () => {
    expect(
      intervalSelectHelpers.fromRange(
        { from: startDate, to: startDate },
        interval
      )
    ).toEqual({ type: 'custom', startDate, endDate: startDate });
    expect(intervalSelectHelpers.fromRange({ from: startDate })).toEqual({
      type: 'custom',
      startDate,
      endDate: undefined,
    });
    expect(intervalSelectHelpers.fromRange(undefined)).toEqual({
      type: 'custom',
    });
  });

  it('rejects reversed and invalid custom dates', () => {
    expect(
      intervalSelectHelpers.fromRange({ from: endDate, to: startDate })
    ).toEqual({ type: 'custom' });
    expect(
      intervalSelectHelpers.fromRange({ from: new Date('invalid') })
    ).toEqual({ type: 'custom' });
  });

  it('enforces either custom boundary inclusively by calendar day', () => {
    expect(
      intervalSelectHelpers.fromRange(
        { from: new Date(2025, 11, 31) },
        { periods: [], startDate }
      )
    ).toEqual({ type: 'custom' });
    expect(
      intervalSelectHelpers.fromRange(
        { from: new Date(2026, 1, 1) },
        { periods: [], endDate }
      )
    ).toEqual({ type: 'custom' });
    expect(
      intervalSelectHelpers.fromRange(
        { from: startDate, to: endDate },
        { ...interval, startDate: new Date(2026, 0, 1, 15) }
      )
    ).toEqual({ type: 'custom', startDate, endDate });
  });

  it('refreshes period dates by ordinal and falls back when removed', () => {
    const selection = intervalSelectHelpers.initial(interval);
    const updatedPeriod = { ...period, endDate: new Date(2026, 0, 30) };
    expect(
      intervalSelectHelpers.reconcile(selection, {
        ...interval,
        periods: [updatedPeriod],
      })
    ).toEqual({
      type: 'period',
      ordinal: 0,
      startDate,
      endDate: updatedPeriod.endDate,
    });
    expect(
      intervalSelectHelpers.reconcile(selection, { ...interval, periods: [] })
    ).toEqual({ type: 'all-time', startDate, endDate });
  });

  it('updates all-time boundaries and resets when a boundary disappears', () => {
    const selection = intervalSelectHelpers.fromOption('all-time', interval);
    expect(
      intervalSelectHelpers.reconcile(selection, {
        periods: [],
        startDate,
        endDate: new Date(2026, 1, 28),
      })
    ).toEqual({ type: 'all-time', startDate, endDate: new Date(2026, 1, 28) });
    expect(intervalSelectHelpers.reconcile(selection)).toEqual({
      type: 'custom',
    });
  });

  it('preserves valid custom dates and clears dates outside new bounds', () => {
    const selection = intervalSelectHelpers.fromRange({
      from: startDate,
      to: endDate,
    });

    expect(intervalSelectHelpers.reconcile(selection, interval)).toEqual(
      selection
    );
    expect(
      intervalSelectHelpers.reconcile(selection, {
        ...interval,
        startDate: new Date(2026, 0, 2),
      })
    ).toEqual({ type: 'custom' });
  });

  it('identifies effective selections by type, ordinal and date values', () => {
    expect(intervalSelectHelpers.key({ type: 'custom', startDate })).toBe(
      intervalSelectHelpers.key({
        type: 'custom',
        startDate: new Date(startDate),
      })
    );
    expect(
      intervalSelectHelpers.key(intervalSelectHelpers.initial(interval))
    ).not.toBe(
      intervalSelectHelpers.key({ type: 'all-time', startDate, endDate })
    );
  });

  it('preserves a preset type when the picker normalizes its calendar dates', () => {
    const selection = {
      type: 'period' as const,
      ordinal: 0,
      startDate: new Date(2026, 0, 1, 15),
      endDate: new Date(2026, 0, 31, 15),
    };

    expect(
      intervalSelectHelpers.withRange(selection, { startDate, endDate })
    ).toEqual(selection);
    const allTime = { type: 'all-time' as const, startDate, endDate };
    expect(
      intervalSelectHelpers.withRange(allTime, { startDate, endDate })
    ).toEqual(allTime);
  });

  it('marks edited or incomplete draft ranges as Custom without inferring a matching preset', () => {
    const selection = intervalSelectHelpers.initial(interval);
    expect(intervalSelectHelpers.withRange(selection, { startDate })).toEqual({
      type: 'custom',
      startDate,
      endDate: undefined,
    });
    expect(
      intervalSelectHelpers.withRange(selection, {
        startDate: new Date(2026, 0, 2),
        endDate,
      })
    ).toEqual({ type: 'custom', startDate: new Date(2026, 0, 2), endDate });
    expect(
      intervalSelectHelpers.withRange(
        { type: 'custom' },
        { startDate, endDate }
      )
    ).toEqual({ type: 'custom', startDate, endDate });
  });

  it('keeps picker identity stable for equivalent inputs and resets it when options or bounds change', () => {
    const selection = intervalSelectHelpers.initial(interval);
    const original = intervalSelectHelpers.pickerKey(selection, interval);
    expect(
      intervalSelectHelpers.pickerKey(selection, {
        ...interval,
        periods: [{ ...period, startDate: new Date(startDate) }],
      })
    ).toBe(original);
    expect(
      intervalSelectHelpers.pickerKey(selection, { ...interval, periods: [] })
    ).not.toBe(original);
    expect(
      intervalSelectHelpers.pickerKey(selection, {
        ...interval,
        periods: [{ ...period, endDate: new Date(2026, 0, 30) }],
      })
    ).not.toBe(original);
    expect(
      intervalSelectHelpers.pickerKey(selection, {
        ...interval,
        endDate: new Date(2026, 1, 1),
      })
    ).not.toBe(original);
    expect(intervalSelectHelpers.pickerKey({ type: 'custom' })).toBe(
      intervalSelectHelpers.pickerKey({ type: 'custom' }, undefined)
    );
  });
});
