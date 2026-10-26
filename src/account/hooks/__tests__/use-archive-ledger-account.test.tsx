import { useArchiveLedgerAccount } from '@/account/hooks/use-archive-ledger-account';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: { archiveLedgerAccount: vi.fn() },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const detailKey = ['ledgerAccountService', 'getLedgerAccount', 'account-1'];

  const affectedKeys = [
    [
      'journalEntryService',
      'getJournalEntries',
      { accountId: 'account-1', page: 1 },
    ],
    ['ledgerReportingService', 'getCurrentAssetAndLiabilityBalancesByCurrency'],
    ['ledgerReportingService', 'getBalanceHistoryBySubType'],
    ['ledgerReportingService', 'getRevenueExpenseAndSuspenseAccountBalances'],
    ['ledgerReportingService', 'getRevenueAndExpenseActivitySummary'],
    [
      'ledgerReportingService',
      'getAccountBalanceContributionsByCounterparty',
      'child-1',
    ],
    ['ledgerReportingService', 'getAccountCashFlow', 'account-1'],
    ['ledgerAccountService', 'getLedgerAccounts', { page: 1 }],
    ['ledgerAccountService', 'getPermittedPostingAccounts', { flow: 'inflow' }],
    ['ledgerAccountService', 'getSubAccounts', 'parent-1'],
    ['ledgerAccountService', 'getLedgerAccount', 'child-1'],
  ];

  queryClient.setQueryData(detailKey, { id: 'account-1', status: 'active' });
  affectedKeys.forEach((key) => queryClient.setQueryData(key, []));
  queryClient.setQueryData(['unrelated'], 'unchanged');

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(() => useArchiveLedgerAccount(), { wrapper }),
    queryClient,
    detailKey,
    affectedKeys,
  };
}

describe('useArchiveLedgerAccount', () => {
  beforeEach(() => vi.resetAllMocks());

  it('handles an empty response, updates status and invalidates account caches including descendants and posting selectors', async () => {
    vi.mocked(ledgerAccountService.archiveLedgerAccount).mockResolvedValue(
      undefined
    );
    const { result, queryClient, detailKey, affectedKeys } = setup();

    await act(async () => {
      await result.current.mutateAsync('account-1');
    });

    expect(ledgerAccountService.archiveLedgerAccount).toHaveBeenCalledWith(
      'account-1'
    );
    expect(queryClient.getQueryData(detailKey)).toEqual({
      id: 'account-1',
      status: 'archived',
    });
    for (const key of [detailKey, ...affectedKeys]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }

    expect(queryClient.getQueryState(['unrelated'])?.isInvalidated).toBe(false);
  });

  it('preserves cached status and lists on failure', async () => {
    const error = new Error('Archive failed');
    vi.mocked(ledgerAccountService.archiveLedgerAccount).mockRejectedValue(
      error
    );
    const { result, queryClient, detailKey, affectedKeys } = setup();

    await act(async () => {
      await expect(result.current.mutateAsync('account-1')).rejects.toBe(error);
    });

    expect(queryClient.getQueryData(detailKey)).toEqual({
      id: 'account-1',
      status: 'active',
    });
    for (const key of [detailKey, ...affectedKeys]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
  });
});
