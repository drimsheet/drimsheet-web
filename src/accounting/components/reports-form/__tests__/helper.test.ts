import reportsFormHelpers from '@/accounting/components/reports-form/helper';
import { describe, expect, it } from 'vitest';

const financialYear = {
  name: 'FY 2026',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

const createName = (_unit: string, index: number) => `Q${index}`;

describe('reports form values', () => {
  it('starts with independent name, currency, and quarterly reporting periods', () => {
    expect(reportsFormHelpers.createInitialValues()).toEqual({
      name: '',
      currencyCode: '',
      unit: 'quarter',
      periodNames: {},
    });
  });
  it('indexes supplied names by grouping and date range', () => {
    const period = {
      name: 'Board review',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    };

    const values = reportsFormHelpers.createInitialValues({
      name: 'Board pack',
      currencyCode: 'NGN',
      periods: [period],
    });

    expect(
      values.periodNames[reportsFormHelpers.periodKey('quarter', period)]
    ).toBe('Board review');
    expect(
      reportsFormHelpers.createPeriods(values, financialYear, createName, 18)[0]
    ).toEqual(period);
  });
  it('recalculates changed dates while retaining names for unchanged ranges', () => {
    const values = reportsFormHelpers.createInitialValues({
      periods: [
        { name: 'Launch', startDate: '2026-01-01', endDate: '2026-03-31' },
        {
          name: 'Old year end',
          startDate: '2026-10-01',
          endDate: '2026-12-31',
        },
      ],
    });

    const periods = reportsFormHelpers.createPeriods(
      values,
      { ...financialYear, endDate: '2026-12-30' },
      createName,
      18
    );

    expect(periods[0].name).toBe('Launch');
    expect(periods[3]).toEqual({
      name: 'Q4',
      startDate: '2026-10-01',
      endDate: '2026-12-30',
    });
  });
  it('retains blank edited names for validation instead of replacing them', () => {
    const values = reportsFormHelpers.createInitialValues({
      periods: [{ name: '', startDate: '2026-01-01', endDate: '2026-03-31' }],
    });

    expect(
      reportsFormHelpers.createPeriods(values, financialYear, createName, 18)[0]
        .name
    ).toBe('');
  });
});
