import helpers from '@/reporting/components/balance-trend/helper';
import { expect, it } from 'vitest';
it('formats chart dates and converts minor units without changing source money', () => {
  const amount = { amount: -12345, currencyCode: 'USD', isMinorUnit: true };
  expect(helpers.chartData([{ date: '2026-05-24', amount }], 'en-US')).toEqual([
    { date: '2026-05-24', label: 'May 24', amount: -123.45, money: amount },
  ]);
  expect(helpers.formatDate('2026-05-24', 'en-US')).toBe('May 24, 2026');
});
