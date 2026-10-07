import { useArchiveCounterparty } from '@/counterparty/hooks/use-archive-counterparty';
import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { counterpartyQueryKey } from '@/counterparty/hooks/use-counterparty';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: { archiveCounterparty: vi.fn() },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const listKey = [...useCounterpartiesQueryKey, { page: 1 }];
  const detailKey = counterpartyQueryKey('counterparty-1');
  queryClient.setQueryData(listKey, { data: [{ id: 'counterparty-1' }] });
  queryClient.setQueryData(detailKey, {
    id: 'counterparty-1',
    status: 'active',
  });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(() => useArchiveCounterparty(), { wrapper }),
    detailKey,
    listKey,
    queryClient,
  };
}

describe('useArchiveCounterparty', () => {
  beforeEach(() => vi.resetAllMocks());

  it('archives the requested counterparty, refreshes lists, and updates detail data', async () => {
    const archived = {
      id: 'counterparty-1',
      status: 'archived',
    };

    vi.mocked(counterpartyService.archiveCounterparty).mockResolvedValue(
      archived as never
    );

    const { result, queryClient, listKey, detailKey } = setup();

    await act(async () => {
      await result.current.mutateAsync('counterparty-1');
    });

    expect(counterpartyService.archiveCounterparty).toHaveBeenCalledWith(
      'counterparty-1'
    );
    expect(queryClient.getQueryData(detailKey)).toEqual(archived);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it('preserves cached data when archiving fails', async () => {
    const error = new Error('Archive failed');
    vi.mocked(counterpartyService.archiveCounterparty).mockRejectedValue(error);
    const { result, queryClient, listKey, detailKey } = setup();

    await act(async () => {
      await expect(result.current.mutateAsync('counterparty-1')).rejects.toBe(
        error
      );
    });

    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryData(detailKey)).toEqual({
      id: 'counterparty-1',
      status: 'active',
    });
  });
});
