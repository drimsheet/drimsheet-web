import { useCategoryHistory } from '@/account/hooks/use-category-history';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { getJournalEntries: vi.fn() },
}));

it('requests posted transactions on every page and combines the results', async () => {
  const first: IJournalEntryListDto = {
    id: 'entry-1',
    accountingEntityId: 'entity-1',
    sourceType: 'expense',
    memo: null,
    status: 'posted',
    effectiveDate: '2026-10-01T00:00:00Z',
    postedAt: '2026-10-01T00:00:00Z',
    voidedAt: null,
    voidingEntryId: null,
    createdBy: 'user-1',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    attachments: [],
    lines: [],
  };

  const second = { ...first, id: 'entry-2' };

  vi.mocked(journalEntryService.getJournalEntries)
    .mockResolvedValueOnce({
      data: [first],
      meta: { page: 1, limit: 100, total: 2, totalPages: 2 },
    })
    .mockResolvedValueOnce({
      data: [second],
      meta: { page: 2, limit: 100, total: 2, totalPages: 2 },
    });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useCategoryHistory('category-1', true), {
    wrapper,
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual([first, second]);
  expect(journalEntryService.getJournalEntries).toHaveBeenCalledTimes(2);
  for (const page of [1, 2]) {
    expect(journalEntryService.getJournalEntries).toHaveBeenNthCalledWith(
      page,
      {
        accountId: 'category-1',
        status: 'posted',
        limit: 100,
        orderBy: 'effectiveDate',
        sortDirection: 'desc',
        page,
      },
      expect.any(AbortSignal)
    );
  }
});
