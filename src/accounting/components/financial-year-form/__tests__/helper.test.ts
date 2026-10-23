import financialYearFormHelpers from '@/accounting/components/financial-year-form/helper';
import { describe, expect, it } from 'vitest';

const createName = (_unit: string, index: number) => `Period ${index}`;

describe('financial year periods', () => {
  it('uses the supplied current year and quarterly grouping by default', () => {
    const values = financialYearFormHelpers.createInitialValues(
      '2026-10-22',
      createName,
      23,
      '2026 Financial Year'
    );

    expect(values).toMatchObject({
      name: '2026 Financial Year',
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

it('preserves an explicitly supplied year name', () => {
  expect(
    financialYearFormHelpers.createInitialValues(
      '2026-10-22',
      createName,
      23,
      '2026 Financial Year',
      { name: 'Custom year' }
    ).name
  ).toBe('Custom year');
});

it('restricts each date picker using the opposite date in local calendar time', () => {
  expect(
    financialYearFormHelpers.getDateRestrictions('2026-04-01', '2027-03-31')
  ).toEqual({
    start: { after: new Date(2027, 2, 31) },
    end: { before: new Date(2026, 3, 1) },
  });
});

it('does not restrict calendars using missing or invalid dates', () => {
  expect(
    financialYearFormHelpers.getDateRestrictions('', '2026-02-30')
  ).toEqual({ start: undefined, end: undefined });
});

it.each([
  ['NG', '2026-01-01', '2026-12-31'],
  ['AU', '2026-07-01', '2027-06-30'],
  ['IN', '2026-04-01', '2027-03-31'],
  ['ZA', '2026-03-01', '2027-02-28'],
])(
  'uses the restored %s fiscal-year configuration',
  (jurisdiction, startDate, endDate) => {
    expect(
      financialYearFormHelpers.getOfficialDates('2026-10-23', jurisdiction)
    ).toEqual({ startDate, endDate });
    expect(
      financialYearFormHelpers.createInitialValues(
        '2026-10-23',
        createName,
        23,
        '2026 Financial Year',
        {},
        jurisdiction
      )
    ).toMatchObject({ startDate, endDate });
  }
);

it('includes leap day at the end of a March financial year', () => {
  expect(financialYearFormHelpers.getOfficialDates('2023-10-23', 'ZA')).toEqual(
    { startDate: '2023-03-01', endDate: '2024-02-29' }
  );
});

it.each([undefined, 'XX'])(
  'does not claim official dates for an unknown jurisdiction %s',
  (jurisdiction) => {
    expect(
      financialYearFormHelpers.getOfficialDates('2026-10-23', jurisdiction)
    ).toBeUndefined();
  }
);
