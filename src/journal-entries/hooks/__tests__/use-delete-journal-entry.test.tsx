import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { journalEntriesQueryKey } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryQueryKey } from '@/journal-entries/hooks/use-journal-entry';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { deleteJournalEntry: vi.fn() },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const listKey = [...journalEntriesQueryKey, { page: 1 }];
  const detailKey = journalEntryQueryKey('entry-1');
  queryClient.setQueryData(listKey, { data: [{ id: 'entry-1' }] });
  queryClient.setQueryData(detailKey, { id: 'entry-1', version: 3 });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(() => useDeleteJournalEntry(), { wrapper }),
    queryClient,
    listKey,
    detailKey,
  };
}

describe('useDeleteJournalEntry', () => {
  beforeEach(() => vi.resetAllMocks());

  it('deletes the requested version and invalidates cached lists and transaction details', async () => {
    vi.mocked(journalEntryService.deleteJournalEntry).mockResolvedValue(
      undefined
    );
    const { result, queryClient, listKey, detailKey } = setup();

    await act(async () => {
      await result.current.mutateAsync({
        id: 'entry-1',
        payload: { expectedVersion: 3 },
      });
    });

    expect(journalEntryService.deleteJournalEntry).toHaveBeenCalledWith(
      'entry-1',
      { expectedVersion: 3 }
    );
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(true);
  });

  it('preserves cached data when deletion fails', async () => {
    const error = new Error('Delete failed');
    vi.mocked(journalEntryService.deleteJournalEntry).mockRejectedValue(error);
    const { result, queryClient, listKey, detailKey } = setup();

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: 'entry-1',
          payload: { expectedVersion: 3 },
        })
      ).rejects.toBe(error);
    });

    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryData(detailKey)).toEqual({
      id: 'entry-1',
      version: 3,
    });
  });
});
