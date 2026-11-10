import { journalEntriesQueryKey } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryQueryKey } from '@/journal-entries/hooks/use-journal-entry';
import { useVoidEntry } from '@/journal-entries/hooks/use-void-entry';
import { drimsheetApi } from '@/shared/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: { journalEntries: { voidJournalEntry: vi.fn() } },
}));

describe('useVoidEntry', () => {
  it('calls the generated void operation and invalidates cached lists and details', async () => {
    const api = drimsheetApi.journalEntries;
    vi.mocked(api.voidJournalEntry).mockResolvedValue({
      data: undefined,
    } as never);

    const queryClient = new QueryClient();
    const listKey = [...journalEntriesQueryKey, { page: 1 }];
    const detailKey = journalEntryQueryKey('entry-1');
    queryClient.setQueryData(listKey, { data: [{ id: 'entry-1' }] });
    queryClient.setQueryData(detailKey, { id: 'entry-1' });

    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useVoidEntry(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('entry-1');
    });

    expect(api.voidJournalEntry).toHaveBeenCalledExactlyOnceWith('entry-1');
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(true);
  });
});
