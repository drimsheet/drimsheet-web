import { accountingPeriodUtils } from '@/accounting/lib/utils/accounting-periods';
import { describe, expect, it } from 'vitest';

const createName = (_unit: string, index: number) => `Period ${index}`;
describe('accounting periods', () => {
  it('handles leap days and truncates the last weekly period', () => {
    expect(
      accountingPeriodUtils.createPeriods(
        { startDate: '2024-02-25', endDate: '2024-03-04', unit: 'week' },
        createName,
        18
      )
    ).toEqual([
      { name: 'Period 1', startDate: '2024-02-25', endDate: '2024-03-02' },
      { name: 'Period 2', startDate: '2024-03-03', endDate: '2024-03-04' },
    ]);
    expect(
      accountingPeriodUtils.createPeriods(
        { startDate: '2024-01-01', endDate: '2024-12-31', unit: 'day' },
        createName,
        18
      )
    ).toHaveLength(366);
  });
  it('anchors month boundaries to the original start without drifting', () => {
    const periods = accountingPeriodUtils.createPeriods(
      { startDate: '2026-01-31', endDate: '2026-04-10', unit: 'month' },
      createName,
      18
    );

    expect(
      periods.map(({ startDate, endDate }) => [startDate, endDate])
    ).toEqual([
      ['2026-01-31', '2026-02-27'],
      ['2026-02-28', '2026-03-30'],
      ['2026-03-31', '2026-04-10'],
    ]);
  });
  it('preserves edited names only for unchanged date ranges', () => {
    const periods = accountingPeriodUtils.createPeriods(
      { startDate: '2026-01-01', endDate: '2026-04-15', unit: 'quarter' },
      createName,
      18,
      [
        { name: 'Launch', startDate: '2026-01-01', endDate: '2026-03-31' },
        { name: 'Summer', startDate: '2026-04-01', endDate: '2026-06-30' },
      ]
    );

    expect(periods.map(({ name }) => name)).toEqual(['Launch', 'Period 2']);
  });
  it('uses one period for the entire financial year', () => {
    expect(
      accountingPeriodUtils.createPeriods(
        { startDate: '2026-04-01', endDate: '2027-09-30', unit: 'year' },
        createName,
        18
      )
    ).toEqual([
      { name: 'Period 1', startDate: '2026-04-01', endDate: '2027-09-30' },
    ]);
  });
  it.each([
    ['2026-02-30', '2026-12-31'],
    ['invalid', '2026-12-31'],
    ['2026-01-01', '2025-12-31'],
    ['2026-01-01', '2027-07-02'],
  ])(
    'rejects invalid or out-of-range dates %s to %s before generating rows',
    (startDate, endDate) => {
      expect(accountingPeriodUtils.isValidRange(startDate, endDate, 18)).toBe(
        false
      );
      expect(
        accountingPeriodUtils.createPeriods(
          { startDate, endDate, unit: 'day' },
          createName,
          18
        )
      ).toEqual([]);
    }
  );
  it('formats calendar dates without timezone shifts', () => {
    expect(accountingPeriodUtils.formatDate('2026-01-01', 'en-GB')).toBe(
      '1 Jan 2026'
    );
  });
});

it('accepts the exact calendar-month boundary and rejects the next day', () => {
  expect(
    accountingPeriodUtils.isValidRange('2026-01-01', '2027-12-01', 23)
  ).toBe(true);
  expect(
    accountingPeriodUtils.isValidRange('2026-01-01', '2027-12-02', 23)
  ).toBe(false);
  expect(
    accountingPeriodUtils
      .createPeriods(
        { startDate: '2026-01-01', endDate: '2027-12-01', unit: 'year' },
        createName,
        23
      )
      .at(-1)?.endDate
  ).toBe('2027-12-01');
});
