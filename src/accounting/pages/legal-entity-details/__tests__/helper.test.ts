import fixtures from '@/accounting/pages/legal-entity-details/__stories__/fixtures.json';
import helpers from '@/accounting/pages/legal-entity-details/helper';
import type { IAccountingInterval, IFiscalYear } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';
const accountingInterval = fixtures.accountingInterval as IAccountingInterval;
const now = fixtures.now;
const year = fixtures.year as IFiscalYear;

describe('legalEntityDetailsHelpers', () => {
  it('formats inclusive fiscal dates and exclusive interval ends in UTC', () => {
    expect(helpers.formatDate('2027-01-01T00:00:00Z', 'en-GB', true)).toBe(
      '31 Dec 2026'
    );
    expect(helpers.formatDate('2026-12-31T00:00:00Z', 'en-GB')).toBe(
      '31 Dec 2026'
    );
    expect(helpers.formatDate('invalid', 'en-GB')).toBe('—');
  });
  it('keeps an explicitly selected fiscal year, otherwise selects the current year', () => {
    const previous = {
      ...year,
      id: 'previous',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    };

    const future = {
      ...year,
      id: 'future',
      startDate: '2027-01-01',
      endDate: '2027-12-31',
    };

    expect(
      helpers.selectFiscalYear([previous, future, year], undefined, now)
    ).toBe(year);
    expect(helpers.selectFiscalYear([previous, year], previous.id, now)).toBe(
      previous
    );
    expect(
      helpers.selectFiscalYear(
        [previous, year],
        undefined,
        Date.parse('2026-12-31T23:59:59Z')
      )
    ).toBe(year);
    expect(helpers.selectFiscalYear([previous, future], undefined, now)).toBe(
      future
    );
    expect(helpers.selectFiscalYear([], undefined, now)).toBeUndefined();
  });
  it('shows the API current ordinal only within its inclusive-start exclusive-end range', () => {
    const current = accountingInterval.periods[0];
    expect(
      helpers.currentPeriod(accountingInterval, Date.parse(current.startDate))
    ).toBe(current);
    expect(
      helpers.currentPeriod(accountingInterval, Date.parse(current.endDate))
    ).toBeUndefined();
    expect(
      helpers.currentPeriod(
        { ...accountingInterval, currentPeriodOrdinal: 9 },
        now
      )
    ).toBeUndefined();
    expect(
      helpers.currentPeriod(accountingInterval, Date.parse('2026-09-30'))
    ).toBeUndefined();
  });
  it('resolves compact currency and jurisdiction names with flags and safe unknown fallbacks', () => {
    expect(helpers.currency('NGN')).toEqual({
      name: 'Nigerian Naira',
      flag: '🇳🇬',
    });
    expect(helpers.currency('unknown')).toEqual({ name: 'unknown', flag: '' });
    expect(helpers.jurisdiction('NG')).toEqual({ name: 'Nigeria', flag: '🇳🇬' });
    expect(helpers.jurisdiction('unknown')).toEqual({
      name: 'unknown',
      flag: '',
    });
  });
  it('uses at most two initials and handles whitespace and an empty name', () => {
    expect(helpers.initials('  Amara Studio Ltd ')).toBe('AS');
    expect(helpers.initials('Amara')).toBe('A');
    expect(helpers.initials('')).toBe('');
  });
});
