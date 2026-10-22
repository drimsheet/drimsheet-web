import financialYearFormHelpers from '@/accounting/components/financial-year-form/helper';
import { describe, expect, it } from 'vitest';

const createName = (_unit: string, index: number) => `Period ${index}`;

describe('financial year periods', () => {
  it('uses the supplied current year and quarterly grouping by default', () => {
    const values = financialYearFormHelpers.createInitialValues(
      '2026-10-22',
      createName,
      18
    );

    expect(values).toMatchObject({
      name: '',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      unit: 'quarter',
    });
    expect(values.periods).toEqual([
      { name: 'Period 1', startDate: '2026-01-01', endDate: '2026-03-31' },
      { name: 'Period 2', startDate: '2026-04-01', endDate: '2026-06-30' },
      { name: 'Period 3', startDate: '2026-07-01', endDate: '2026-09-30' },
      { name: 'Period 4', startDate: '2026-10-01', endDate: '2026-12-31' },
    ]);
  });
  it('handles leap days and truncates the last weekly period', () => {
    expect(
      financialYearFormHelpers.createPeriods(
        { startDate: '2024-02-25', endDate: '2024-03-04', unit: 'week' },
        createName,
        18
      )
    ).toEqual([
      { name: 'Period 1', startDate: '2024-02-25', endDate: '2024-03-02' },
      { name: 'Period 2', startDate: '2024-03-03', endDate: '2024-03-04' },
    ]);
    expect(
      financialYearFormHelpers.createPeriods(
        { startDate: '2024-01-01', endDate: '2024-12-31', unit: 'day' },
        createName,
        18
      )
    ).toHaveLength(366);
  });
  it('anchors month boundaries to the original start without drifting', () => {
    const periods = financialYearFormHelpers.createPeriods(
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
    const periods = financialYearFormHelpers.createPeriods(
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
      financialYearFormHelpers.createPeriods(
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
    ['2026-01-01', '2027-07-01'],
  ])(
    'rejects invalid or out-of-range dates %s to %s before generating rows',
    (startDate, endDate) => {
      expect(
        financialYearFormHelpers.isValidRange(startDate, endDate, 18)
      ).toBe(false);
      expect(
        financialYearFormHelpers.createPeriods(
          { startDate, endDate, unit: 'day' },
          createName,
          18
        )
      ).toEqual([]);
    }
  );
  it('formats calendar dates without timezone shifts', () => {
    expect(financialYearFormHelpers.formatDate('2026-01-01', 'en-GB')).toBe(
      '1 Jan 2026'
    );
  });
});
