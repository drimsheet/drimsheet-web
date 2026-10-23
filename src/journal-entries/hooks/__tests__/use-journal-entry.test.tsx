import { useJournalEntry } from '@/journal-entries/hooks/use-journal-entry';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import { ErrorBoundary } from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, screen, waitFor } from '@testing-library/react';
import type { AxiosError } from 'axios';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { getJournalEntry: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={<p>Entry unavailable</p>}>
        {children}
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

describe('useJournalEntry', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches the selected entry by ID', async () => {
    vi.mocked(journalEntryService.getJournalEntry).mockResolvedValue({
      id: 'entry-1',
    } as never);

    const { result } = renderHook(() => useJournalEntry('entry-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(journalEntryService.getJournalEntry).toHaveBeenCalledWith('entry-1');
  });

  it('surfaces server failure immediately without overriding disabled retries', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    vi.mocked(journalEntryService.getJournalEntry).mockRejectedValue(
      new Error('Server unavailable')
    );
    try {
      renderHook(() => useJournalEntry('failed-entry'), {
        wrapper: createWrapper(),
      });
      expect(await screen.findByText('Entry unavailable')).toBeVisible();
      expect(journalEntryService.getJournalEntry).toHaveBeenCalledTimes(1);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('does not query without an ID', () => {
    const { result } = renderHook(() => useJournalEntry(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(journalEntryService.getJournalEntry).not.toHaveBeenCalled();
  });

  it('returns a 404 error to the page instead of throwing it', async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          name: 'NotFoundError',
          errorKey: 'app_error_resource_not_found',
          validationErrors: [],
        },
        headers: {},
      },
    } as AxiosError;

    vi.mocked(journalEntryService.getJournalEntry).mockRejectedValue(error);

    const { result } = renderHook(() => useJournalEntry('missing-entry'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
