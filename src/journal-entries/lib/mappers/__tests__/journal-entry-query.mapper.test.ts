import { journalEntryQueryMapper } from '@/journal-entries/lib/mappers/journal-entry-query.mapper';
import { describe, expect, it } from 'vitest';

describe('journalEntryQueryMapper', () => {
  it('maps combined filters and inclusive local days without leaking client fields', () => {
    const query = journalEntryQueryMapper.toQuery(
      {
        sourceType: 'receipt',
        categoryId: 'revenue-1',
        counterpartyId: 'party-1',
        currencyCode: 'USD',
        effectiveDateFrom: '2026-10-01',
        effectiveDateTo: '2026-10-29',
        recordedDateFrom: '2026-10-02',
        recordedDateTo: '2026-10-03',
      },
      {
        page: 2,
        limit: 25,
        search: '  invoice  ',
        orderBy: 'createdAt',
        sortDirection: 'asc',
      }
    );

    expect(query).toEqual({
      page: 2,
      limit: 25,
      search: 'invoice',
      orderBy: 'createdAt',
      sortDirection: 'asc',
      sourceType: 'receipt',
      accountId: 'revenue-1',
      counterpartyId: 'party-1',
      currencyCode: 'USD',
      effectiveDateFrom: '2026-10-01',
      effectiveDateTo: '2026-10-29',
      createdAtFrom: new Date(2026, 9, 2).toISOString(),
      createdAtTo: new Date(2026, 9, 3, 23, 59, 59, 999).toISOString(),
    });
  });
  it.each(['receipt', 'payment', 'transfer'] as const)(
    'passes the %s source type without translating display labels into the query',
    (sourceType) => {
      expect(
        journalEntryQueryMapper.toQuery(
          { sourceType, accountId: 'cash' },
          { search: ' ' }
        )
      ).toEqual({
        page: undefined,
        limit: undefined,
        search: undefined,
        orderBy: undefined,
        sortDirection: undefined,
        effectiveDateFrom: undefined,
        effectiveDateTo: undefined,
        createdAtFrom: undefined,
        createdAtTo: undefined,
        sourceType,
        accountId: 'cash',
        counterpartyId: undefined,
        currencyCode: undefined,
      });
    }
  );
});
