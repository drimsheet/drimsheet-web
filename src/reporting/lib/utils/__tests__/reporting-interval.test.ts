import reportingIntervalUtils from '@/reporting/lib/utils/reporting-interval';
import type { IInterval } from '@/shared/components/interval-select';
import { describe, expect, it } from 'vitest';

const interval: IInterval = {
  startDate: new Date(2024, 0, 1),
  endDate: new Date(2025, 11, 31),
  periods: [
    {
      ordinal: 0,
      name: 'January',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 31),
    },
  ],
};

describe('reportingIntervalUtils', () => {
  it('resolves periods from current interval dates instead of retaining stale callback dates', () => {
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'period',
          ordinal: 0,
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 31),
        },
        interval
      )
    ).toEqual({ from: '2024-01-01', to: '2024-01-31' });
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'period',
          ordinal: 99,
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 0, 31),
        },
        interval
      )
    ).toBeUndefined();
  });

  it('uses the full interval for All time and keeps valid Custom dates', () => {
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'all-time',
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 0, 31),
        },
        interval
      )
    ).toEqual({ from: '2024-01-01', to: '2025-12-31' });
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'custom',
          startDate: new Date(2024, 1, 29),
          endDate: new Date(2024, 1, 29),
        },
        interval
      )
    ).toEqual({ from: '2024-02-29', to: '2024-02-29' });
  });

  it('does not construct queries for missing, incomplete, invalid, reversed or out-of-bounds selections', () => {
    expect(reportingIntervalUtils.toRange()).toBeUndefined();
    expect(
      reportingIntervalUtils.toRange({ type: 'custom' }, interval)
    ).toBeUndefined();
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'custom',
          startDate: new Date('invalid'),
          endDate: new Date(2024, 0, 1),
        },
        interval
      )
    ).toBeUndefined();
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'custom',
          startDate: new Date(2024, 0, 2),
          endDate: new Date(2024, 0, 1),
        },
        interval
      )
    ).toBeUndefined();
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'custom',
          startDate: new Date(2023, 11, 31),
          endDate: new Date(2024, 0, 1),
        },
        interval
      )
    ).toBeUndefined();
    expect(
      reportingIntervalUtils.toRange(
        {
          type: 'custom',
          startDate: new Date(2025, 11, 31),
          endDate: new Date(2026, 0, 1),
        },
        interval
      )
    ).toBeUndefined();
  });

  it('accepts 366 inclusive days and rejects 367 days', () => {
    expect(
      reportingIntervalUtils.isTooLong({ from: '2024-01-01', to: '2024-12-31' })
    ).toBe(false);
    expect(
      reportingIntervalUtils.isTooLong({ from: '2024-01-01', to: '2025-01-01' })
    ).toBe(true);
    expect(reportingIntervalUtils.isTooLong()).toBe(false);
  });

  it('keeps chart bucket counts readable for arbitrary ranges, including a single day', () => {
    expect(
      reportingIntervalUtils.bucketDays({
        from: '2026-01-01',
        to: '2026-01-01',
      })
    ).toBe(1);
    expect(
      reportingIntervalUtils.bucketDays({
        from: '2026-10-01',
        to: '2026-10-31',
      })
    ).toBe(3);
    expect(
      reportingIntervalUtils.bucketDays({
        from: '2026-01-01',
        to: '2026-12-31',
      })
    ).toBe(31);
  });
});
