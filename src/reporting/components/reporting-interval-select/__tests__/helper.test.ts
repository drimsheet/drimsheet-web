import reportingIntervalSelectHelpers from '@/reporting/components/reporting-interval-select/helper';
import { describe, expect, it } from 'vitest';

describe('reportingIntervalSelectHelpers', () => {
  it('serializes the applied calendar dates into an inclusive API range', () => {
    expect(
      reportingIntervalSelectHelpers.toRange({
        type: 'custom',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
      })
    ).toEqual({ from: '2024-02-01', to: '2024-02-29' });
  });

  it('leaves incomplete selections empty', () => {
    expect(
      reportingIntervalSelectHelpers.toRange({ type: 'custom' })
    ).toBeUndefined();
    expect(
      reportingIntervalSelectHelpers.toRange({
        type: 'custom',
        startDate: new Date(2024, 0, 1),
      })
    ).toBeUndefined();
    expect(
      reportingIntervalSelectHelpers.toRange({
        type: 'custom',
        endDate: new Date(2024, 0, 31),
      })
    ).toBeUndefined();
  });

  it('accepts 366 inclusive days and rejects 367 days', () => {
    expect(
      reportingIntervalSelectHelpers.isTooLong({
        from: '2024-01-01',
        to: '2024-12-31',
      })
    ).toBe(false);
    expect(
      reportingIntervalSelectHelpers.isTooLong({
        from: '2024-01-01',
        to: '2025-01-01',
      })
    ).toBe(true);
    expect(reportingIntervalSelectHelpers.isTooLong()).toBe(false);
  });
});
