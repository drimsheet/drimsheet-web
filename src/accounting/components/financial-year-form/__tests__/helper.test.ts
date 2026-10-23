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
});
