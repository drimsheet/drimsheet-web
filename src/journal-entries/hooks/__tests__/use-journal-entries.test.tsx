import {
  journalEntriesQueryKey,
  useJournalEntries,
} from '@/journal-entries/hooks/use-journal-entries';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import {
  EJournalEntrySortBy,
  EPaginationSortDirection,
  type IGetJournalEntriesQuery,
} from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { getJournalEntries: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useJournalEntries', () => {
  it('delegates the complete list query and exposes the paginated response', async () => {
    const query: IGetJournalEntriesQuery = {
      page: 2,
      limit: 10,
      search: 'gift',
      orderBy: EJournalEntrySortBy.EffectiveDate,
      sortDirection: EPaginationSortDirection.Desc,
    };

    const response = {
      data: [],
      meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
    };

    vi.mocked(journalEntryService.getJournalEntries).mockResolvedValue(
      response
    );

    const { result } = renderHook(() => useJournalEntries(query), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual(response));
    expect(journalEntryService.getJournalEntries).toHaveBeenCalledWith(query);
    expect(journalEntriesQueryKey).toEqual([
      'journalEntryService',
      'getJournalEntries',
    ]);
  });
});
