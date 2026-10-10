import { useCounterpartyTransactions } from '@/counterparty/hooks/use-counterparty-transactions';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: { getCounterpartyTransactions: vi.fn() },
}));

const response = {
  data: [],
  meta: { page: 1, limit: 5, total: 0, totalPages: 0 },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCounterpartyTransactions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(counterpartyService.getCounterpartyTransactions)
      .mockResolvedValueOnce(response)
      .mockImplementation(() => new Promise(() => {}));
  });

  it('retains existing results while searching the same counterparty', async () => {
    const { result, rerender } = renderHook(
      ({ search }) =>
        useCounterpartyTransactions({ counterpartyId: 'first', search }, true),
      { initialProps: { search: '' }, wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ search: 'supplies' });
    expect(result.current.isPending).toBe(false);
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toEqual(response);
  });

  it('never uses another counterparty’s transactions as placeholder data', async () => {
    const { result, rerender } = renderHook(
      ({ counterpartyId }) =>
        useCounterpartyTransactions({ counterpartyId }, true),
      { initialProps: { counterpartyId: 'first' }, wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ counterpartyId: 'second' });
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
