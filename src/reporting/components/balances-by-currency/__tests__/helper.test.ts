import helpers from '@/reporting/components/balances-by-currency/helper';
import { expect, it } from 'vitest';
it('finds currency logos case-insensitively and permits unknown currencies', () => {
  expect(helpers.currencyLogo('ngn')).toBe('https://flagcdn.com/w320/ng.png');
  expect(helpers.currencyLogo('unknown')).toBeUndefined();
});
