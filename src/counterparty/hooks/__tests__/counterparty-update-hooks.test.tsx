import { useCounterparty } from '@/counterparty/hooks/use-counterparty';
import { useCounterpartyFormUpdate } from '@/counterparty/hooks/use-counterparty-form-update';
import { useCounterpartyTransactionUsage } from '@/counterparty/hooks/use-counterparty-transaction-usage';
import { useUpdateCounterparty } from '@/counterparty/hooks/use-update-counterparty';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: {
    updateCounterparty: vi.fn(),
    getCounterpartyTransactions: vi.fn(),
    getCounterparty: vi.fn(),
  },
}));

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { client, wrapper };
}

const empty = {
  data: [],
  meta: { page: 1, limit: 1, total: 0, totalPages: 0 },
};

const party: ICounterpartyDto = {
  id: 'one',
  accountingEntityId: 'entity',
  createdBy: 'actor',
  name: 'Updated',
  type: 'organization',
  status: 'active',
  roles: [],
  meta: {},
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

beforeEach(() => vi.resetAllMocks());

describe('counterparty update hooks', () => {
  it('captures only a ready edit baseline and preserves it until the counterparty ID changes', () => {
    const { result, rerender } = renderHook(
      ({ counterparty, ready }) =>
        useCounterpartyFormUpdate({
          counterpartyId: counterparty.id,
          counterparty,
          ready,
          onSuccess: vi.fn(),
        }),
      { ...setup(), initialProps: { counterparty: party, ready: false } }
    );

    expect(result.current.baseline).toBeUndefined();
    rerender({ counterparty: party, ready: true });
    expect(result.current.baseline).toBe(party);
    const latest = { ...party, name: 'Changed elsewhere' };
    rerender({ counterparty: latest, ready: true });
    expect(result.current.baseline).toBe(party);
    const other = { ...latest, id: 'two' };
    rerender({ counterparty: other, ready: true });
    expect(result.current.baseline).toBe(other);
    expect(counterpartyService.getCounterparty).not.toHaveBeenCalled();
    expect(
      counterpartyService.getCounterpartyTransactions
    ).not.toHaveBeenCalled();
  });

  it('uses cached role information only as a placeholder while reading a fresh edit baseline', async () => {
    const { client, wrapper } = setup();
    const cached = { ...party, roles: ['vendor' as const] };
    client.setQueryData(
      ['counterpartyService', 'getCounterparty', 'one'],
      cached
    );
    let finishRead!: (data: ICounterpartyDto) => void;
    vi.mocked(counterpartyService.getCounterparty).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishRead = resolve;
        })
    );

    const { result } = renderHook(
      () => useCounterparty('one', { scope: 'update', throwOnError: false }),
      { wrapper }
    );

    expect(result.current.data).toEqual(cached);
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.isFetchedAfterMount).toBe(false);
    await act(async () => {
      finishRead(party);
    });
    await waitFor(() => expect(result.current.isFetchedAfterMount).toBe(true));
    expect(result.current.isPlaceholderData).toBe(false);
    expect(result.current.data).toEqual(party);
  });
  it.each(['posted', 'archived'] as const)(
    'locks type for %s-only usage',
    async (status) => {
      vi.mocked(
        counterpartyService.getCounterpartyTransactions
      ).mockImplementation(async (query) => ({
        ...empty,
        meta: { ...empty.meta, total: query.status === status ? 1 : 0 },
      }));

      const { result } = renderHook(
        () => useCounterpartyTransactionUsage('one'),
        setup()
      );

      expect(result.current.canChangeType).toBe(false);
      await waitFor(() => expect(result.current.checking).toBe(false));
      expect(result.current.used).toBe(true);
      expect(result.current.canChangeType).toBe(false);
      expect(
        counterpartyService.getCounterpartyTransactions
      ).toHaveBeenCalledWith({
        counterpartyId: 'one',
        status: 'archived',
        page: 1,
        limit: 1,
      });
    }
  );
  it('allows type only after both checks succeed without usage', async () => {
    vi.mocked(
      counterpartyService.getCounterpartyTransactions
    ).mockResolvedValue(empty);

    const { result } = renderHook(
      () => useCounterpartyTransactionUsage('one'),
      setup()
    );

    await waitFor(() => expect(result.current.canChangeType).toBe(true));
    expect(
      counterpartyService.getCounterpartyTransactions
    ).toHaveBeenCalledTimes(2);
  });
  it('delegates the generated DTO and refreshes only the relevant cache families', async () => {
    const { client, wrapper } = setup();

    const listKey = [
      'counterpartyService',
      'getCounterparties',
      { search: 'Old' },
    ];

    const transactionsKey = ['journalEntryService', 'getJournalEntries', {}];
    client.setQueryData(listKey, []);
    client.setQueryData(transactionsKey, []);
    client.setQueryData(['unrelated'], 'keep');
    vi.mocked(counterpartyService.updateCounterparty).mockResolvedValue(party);
    const request = { name: 'Updated' };

    const { result } = renderHook(() => useUpdateCounterparty('one'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(request);
    });
    expect(counterpartyService.updateCounterparty).toHaveBeenCalledWith(
      'one',
      request
    );
    expect(
      client.getQueryData(['counterpartyService', 'getCounterparty', 'one'])
    ).toEqual(party);
    expect(
      client.getQueryData([
        'counterpartyService',
        'getCounterparty',
        'one',
        'update',
      ])
    ).toEqual(party);
    expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(transactionsKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(['unrelated'])?.isInvalidated).toBe(false);
  });
  it('leaves the detail cache unchanged after a failed update', async () => {
    const { client, wrapper } = setup();
    client.setQueryData(
      ['counterpartyService', 'getCounterparty', 'one'],
      party
    );
    vi.mocked(counterpartyService.updateCounterparty).mockRejectedValue(
      new Error('conflict')
    );

    const { result } = renderHook(() => useUpdateCounterparty('one'), {
      wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ name: 'Other' })
      ).rejects.toThrow('conflict');
    });
    expect(
      client.getQueryData(['counterpartyService', 'getCounterparty', 'one'])
    ).toEqual(party);
  });
  it('prevents an older in-flight read from replacing the saved record', async () => {
    const { client, wrapper } = setup();
    const key = ['counterpartyService', 'getCounterparty', 'one'];
    let finishRead!: (data: ICounterpartyDto) => void;

    const pending = client
      .fetchQuery({
        queryKey: key,
        queryFn: () =>
          new Promise<ICounterpartyDto>((resolve) => {
            finishRead = resolve;
          }),
      })
      .catch(() => undefined);

    vi.mocked(counterpartyService.updateCounterparty).mockResolvedValue(party);

    const { result } = renderHook(() => useUpdateCounterparty('one'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ name: 'Updated' });
      finishRead({ ...party, name: 'Old' });
      await pending;
    });
    expect(client.getQueryData(key)).toEqual(party);
  });
});
