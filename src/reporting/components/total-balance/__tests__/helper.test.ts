import helpers from '@/reporting/components/total-balance/helper';
import { describe, expect, it } from 'vitest';
describe('totalBalanceHelpers', () => {
  it('formats comparisons', () => {
    expect(helpers.formatPercentage(12.5, 'en-US')).toBe('12.5%');
    expect(helpers.formatPercentage(null, 'en-US')).toBe('—');
  });
  it('identifies growth direction', () => {
    expect(helpers.growthDirection(-1)).toBe('down');
    expect(helpers.growthDirection(0)).toBe('neutral');
    expect(helpers.growthDirection(1)).toBe('up');
  });
});
