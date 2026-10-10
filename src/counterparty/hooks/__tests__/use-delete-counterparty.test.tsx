import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { counterpartyQueryKey } from '@/counterparty/hooks/use-counterparty';
import { counterpartyDeletionEligibilityQueryKey } from '@/counterparty/hooks/use-counterparty-deletion-eligibility';
import { useDeleteCounterparty } from '@/counterparty/hooks/use-delete-counterparty';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: { deleteCounterparty: vi.fn() },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const listKey = [...useCounterpartiesQueryKey, { page: 1 }];
  const detailKey = counterpartyQueryKey('counterparty-1');

  const eligibilityKey =
    counterpartyDeletionEligibilityQueryKey('counterparty-1');

  queryClient.setQueryData(listKey, { data: [{ id: 'counterparty-1' }] });
  queryClient.setQueryData(detailKey, { id: 'counterparty-1' });
  queryClient.setQueryData(eligibilityKey, { canDelete: true });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(() => useDeleteCounterparty(), { wrapper }),
    detailKey,
    eligibilityKey,
    listKey,
    queryClient,
  };
}

describe('useDeleteCounterparty', () => {
  beforeEach(() => vi.resetAllMocks());

  it('deletes the counterparty and clears its cached records', async () => {
    vi.mocked(counterpartyService.deleteCounterparty).mockResolvedValue();
    const { result, queryClient, listKey, detailKey, eligibilityKey } = setup();

    await act(async () => {
      await result.current.mutateAsync('counterparty-1');
    });

    expect(
      counterpartyService.deleteCounterparty
    ).toHaveBeenCalledExactlyOnceWith('counterparty-1');
    expect(queryClient.getQueryData(detailKey)).toBeUndefined();
    expect(queryClient.getQueryData(eligibilityKey)).toBeUndefined();
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it('preserves cached records when deletion fails', async () => {
    const error = new Error('Delete failed');
    vi.mocked(counterpartyService.deleteCounterparty).mockRejectedValue(error);
    const { result, queryClient, listKey, detailKey, eligibilityKey } = setup();

    await act(async () => {
      await expect(result.current.mutateAsync('counterparty-1')).rejects.toBe(
        error
      );
    });

    expect(queryClient.getQueryData(detailKey)).toEqual({
      id: 'counterparty-1',
    });
    expect(queryClient.getQueryData(eligibilityKey)).toEqual({
      canDelete: true,
    });
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(false);
  });
});
