import legalEntityHelpers from '@/accounting/pages/legal-entity/helper';
import { describe, expect, it } from 'vitest';

describe('legalEntityHelpers.formatDate', () => {
  it('formats calendar boundaries in UTC, independently of the viewer timezone', () => {
    expect(
      legalEntityHelpers.formatDate(
        '2026-01-01T00:00:00Z',
        'en-GB',
        'Not available'
      )
    ).toBe('1 Jan 2026');
  });
  it('localizes the calendar date', () => {
    expect(
      legalEntityHelpers.formatDate(
        '2026-01-01T00:00:00Z',
        'en-US',
        'Not available'
      )
    ).toBe('Jan 1, 2026');
  });
  it.each([undefined, '', 'not-a-date'])(
    'uses the supplied translated fallback for %s',
    (value) => {
      expect(legalEntityHelpers.formatDate(value, 'en', 'Unavailable')).toBe(
        'Unavailable'
      );
    }
  );
});
