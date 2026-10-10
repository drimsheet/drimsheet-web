import {
  useCheckCounterpartyDeletionEligibility,
  useCounterpartyDeletionEligibility,
} from '@/counterparty/hooks/use-counterparty-deletion-eligibility';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: { getCounterpartyDeletionEligibility: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('counterparty deletion eligibility hooks', () => {
  beforeEach(() => vi.resetAllMocks());

  it('checks eligibility when the detail owner enables the query', async () => {
    vi.mocked(
      counterpartyService.getCounterpartyDeletionEligibility
    ).mockResolvedValue({ canDelete: true });

    const { result } = renderHook(
      () => useCounterpartyDeletionEligibility('counterparty-1', true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ canDelete: true });
    expect(
      counterpartyService.getCounterpartyDeletionEligibility
    ).toHaveBeenCalledExactlyOnceWith('counterparty-1');
  });

  it('does not check table-row eligibility until requested', async () => {
    vi.mocked(
      counterpartyService.getCounterpartyDeletionEligibility
    ).mockResolvedValue({ canDelete: false });

    const { result } = renderHook(
      () => useCheckCounterpartyDeletionEligibility(),
      { wrapper: createWrapper() }
    );

    expect(
      counterpartyService.getCounterpartyDeletionEligibility
    ).not.toHaveBeenCalled();

    await act(async () => {
      await result.current('counterparty-1');
    });

    expect(
      counterpartyService.getCounterpartyDeletionEligibility
    ).toHaveBeenCalledExactlyOnceWith('counterparty-1');
  });
});
