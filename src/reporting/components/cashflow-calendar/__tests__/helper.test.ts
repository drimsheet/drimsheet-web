import helpers from '@/reporting/components/cashflow-calendar/helper';
import { describe, expect, it } from 'vitest';

describe('calendar dates', () => {
  it('pads October with empty cells and starts on Monday', () => {
    const weeks = helpers.weeks(new Date(2026, 9, 26), 'month');
    expect(weeks).toHaveLength(5);
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
    expect(weeks[4][6]).toBeNull();
  });
  it('includes leap day and six-row months', () => {
    expect(
      helpers
        .weeks(new Date(2024, 1, 1), 'month')
        .flat()
        .filter(Boolean)
    ).toHaveLength(29);
    expect(helpers.weeks(new Date(2026, 2, 1), 'month')).toHaveLength(6);
  });
  it('crosses month and year boundaries in week view', () => {
    const week = helpers.weeks(new Date(2026, 11, 31), 'week')[0];
    expect(helpers.dateKey(week[0]!)).toBe('2026-12-28');
    expect(helpers.dateKey(week[6]!)).toBe('2027-01-03');
    expect(helpers.title(new Date(2026, 11, 31), 'week', 'en-GB')).toContain(
      '2027'
    );
  });
  it('navigates from period starts without month-end overflow', () => {
    expect(helpers.move(new Date(2026, 0, 31), 'month', 1)).toEqual(
      new Date(2026, 1, 1)
    );
    expect(helpers.move(new Date(2026, 9, 26), 'week', -1)).toEqual(
      new Date(2026, 9, 19)
    );
    expect(helpers.periodStart(new Date(2026, 9, 28), 'week')).toEqual(
      new Date(2026, 9, 26)
    );
    expect(helpers.title(new Date(2026, 9, 26), 'month', 'en-GB')).toBe(
      'October 2026'
    );
  });
});
