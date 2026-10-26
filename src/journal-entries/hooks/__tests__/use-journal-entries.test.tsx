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
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
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

it('retains the previous page while fetching and reports failures locally', async () => {
  const first = {
    data: [],
    meta: { page: 1, limit: 5, total: 10, totalPages: 2 },
  };

  const second = { ...first, meta: { ...first.meta, page: 2 } };
  const query = { accountId: 'account-1', page: 1, limit: 5 };
  let resolvePage!: (value: typeof second) => void;

  const pendingPage = new Promise<typeof second>((resolve) => {
    resolvePage = resolve;
  });

  vi.mocked(journalEntryService.getJournalEntries)
    .mockResolvedValueOnce(first)
    .mockReturnValueOnce(pendingPage);

  const { result, rerender } = renderHook(
    ({ page }) =>
      useJournalEntries(
        { ...query, page },
        { placeholderData: keepPreviousData, throwOnError: false }
      ),
    {
      initialProps: { page: 1 },
      wrapper: createWrapper(),
    }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  rerender({ page: 2 });
  await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
  expect(result.current.data).toEqual(first);
  expect(result.current.isPending).toBe(false);
  await act(async () => {
    resolvePage(second);
    await pendingPage;
  });
  await waitFor(() => expect(result.current.data).toEqual(second));
  expect(result.current.isPlaceholderData).toBe(false);
  expect(journalEntryService.getJournalEntries).toHaveBeenLastCalledWith({
    ...query,
    page: 2,
  });

  const error = new Error('Unavailable');
  vi.mocked(journalEntryService.getJournalEntries).mockRejectedValueOnce(error);
  await act(async () => {
    await result.current.refetch();
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error).toBe(error);
  expect(result.current.data).toEqual(second);
});

it('exposes an initial failure locally when requested', async () => {
  const error = new Error('Unavailable');
  vi.mocked(journalEntryService.getJournalEntries).mockRejectedValueOnce(error);

  const { result } = renderHook(
    () =>
      useJournalEntries({ accountId: 'account-1' }, { throwOnError: false }),
    { wrapper: createWrapper() }
  );

  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error).toBe(error);
  expect(result.current.data).toBeUndefined();
});
