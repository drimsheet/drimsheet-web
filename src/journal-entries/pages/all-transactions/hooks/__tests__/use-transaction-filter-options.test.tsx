import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { useTransactionFilterOptions } from '@/journal-entries/pages/all-transactions/hooks/use-transaction-filter-options';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: {
    getLedgerAccounts: vi.fn(),
    getPettyBaseCashFilters: () => ({
      type: 'asset',
      subType: 'cash_and_cash_equivalent',
      isControlAccount: false,
    }),
  },
}));
vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: { getCounterparties: vi.fn() },
}));

function wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}

describe('useTransactionFilterOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('loads later pages of cash, revenue, expense and counterparty options', async () => {
    vi.mocked(ledgerAccountService.getLedgerAccounts).mockImplementation(
      async (query) =>
        ({
          data: [
            {
              id: `${query.type}-${query.page}`,
              name: `${query.type} ${query.page}`,
              balance: { currencyCode: query.page === 2 ? 'USD' : 'NGN' },
            },
          ],
          meta: { page: query.page, limit: 100, total: 101, totalPages: 2 },
        }) as never
    );
    vi.mocked(counterpartyService.getCounterparties).mockImplementation(
      async (query) =>
        ({
          data: [{ id: `party-${query.page}`, name: `Party ${query.page}` }],
          meta: { page: query.page, limit: 100, total: 101, totalPages: 2 },
        }) as never
    );

    const { result } = renderHook(() => useTransactionFilterOptions(), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options.accounts).toHaveLength(2);
    expect(result.current.options.categories).toHaveLength(4);
    expect(result.current.options.counterparties).toContainEqual({
      value: 'party-2',
      label: 'Party 2',
    });
    expect(
      result.current.options.currencies.map((option) => option.value)
    ).toEqual(['NGN', 'USD']);
    expect(ledgerAccountService.getLedgerAccounts).toHaveBeenCalledWith(
      { type: 'revenue', isControlAccount: false, page: 2, limit: 100 },
      expect.any(AbortSignal)
    );
  });
  it('reports an option failure instead of silently presenting a complete list', async () => {
    vi.mocked(ledgerAccountService.getLedgerAccounts).mockRejectedValue(
      new Error('unavailable')
    );
    vi.mocked(counterpartyService.getCounterparties).mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => useTransactionFilterOptions(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBe(true));
  });
});
