import { useRectifyJournalEntry } from '@/journal-entries/hooks/use-rectify-journal-entry';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type { TJournalEntryRectificationReq } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { rectifyJournalEntry: vi.fn() },
}));

const payload = {
  attachments: [],
  effectiveDate: '2026-09-21',
  postedAt: null,
  memo: null,
  sourceType: 'payment',
  sourceLine: {
    accountId: 'cash',
    counterparty: { name: 'Vendor' },
    amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    description: null,
    sequenceOrder: 1,
  },
  destinationLines: [],
} satisfies TJournalEntryRectificationReq;

describe('useRectifyJournalEntry', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forwards the generated payload and invalidates detail and list queries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(journalEntryService.rectifyJournalEntry).mockResolvedValue({
      currentJournalEntryId: 'current-entry',
    } as never);

    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useRectifyJournalEntry(), { wrapper });

    await act(async () =>
      result.current.mutateAsync({ id: 'original-entry', payload })
    );

    expect(journalEntryService.rectifyJournalEntry).toHaveBeenCalledWith(
      'original-entry',
      payload
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntry', 'original-entry'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntry', 'current-entry'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntries'],
    });
  });
});
