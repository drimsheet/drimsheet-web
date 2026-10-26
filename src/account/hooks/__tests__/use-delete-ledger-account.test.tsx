import { useDeleteLedgerAccount } from '@/account/hooks/use-delete-ledger-account';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: { deleteLedgerAccount: vi.fn() },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const removedKeys = [
    'getLedgerAccount',
    'getBankDetails',
    'getSubAccounts',
    'getLedgerAccountDeletionEligibility',
  ].map((method) => ['ledgerAccountService', method, 'account-1']);

  const transactionKeys = [
    [
      'journalEntryService',
      'getJournalEntries',
      { accountId: 'account-1', page: 2 },
    ],
    [
      'journalEntryService',
      'getJournalEntries',
      { accountId: 'account-1', limit: 100 },
      'all-pages',
    ],
  ];

  removedKeys.push([
    'ledgerReportingService',
    'getAccountCashFlow',
    'account-1',
  ]);
  removedKeys.push([
    'ledgerReportingService',
    'getAccountCounterpartyParticipation',
    'account-1',
  ]);

  const refreshedKeys = [
    [
      'journalEntryService',
      'getJournalEntries',
      { accountId: 'child-1', page: 1 },
    ],
    ['ledgerReportingService', 'getAccountCashFlow', 'child-1'],
    ['ledgerReportingService', 'getAssetAndLiabilityBalancesByCurrency'],
    ['ledgerReportingService', 'getBalancesBySubType'],
    ['ledgerReportingService', 'getRevenueExpenseAccounts'],
    ['ledgerReportingService', 'getRevenueExpenseSummary'],
    [
      'ledgerReportingService',
      'getAccountCounterpartyParticipation',
      'child-1',
    ],
    ['ledgerAccountService', 'getLedgerAccounts', { page: 1 }],
    ['ledgerAccountService', 'getPermittedPostingAccounts', {}],
    ['ledgerAccountService', 'getSubAccounts', 'parent-1'],
    ['ledgerAccountService', 'getLedgerAccount', 'child-1'],
    ['journalEntryService', 'getJournalEntries', {}],
    ['accountingBootstrapService', 'getRecommendations'],
  ];

  for (const key of [
    ...removedKeys,
    ...transactionKeys,
    ...refreshedKeys,
    ['unrelated'],
  ]) {
    queryClient.setQueryData(key, { cached: true });
  }

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(() => useDeleteLedgerAccount(), { wrapper }),
    queryClient,
    removedKeys: [...removedKeys, ...transactionKeys],
    refreshedKeys,
  };
}

describe('useDeleteLedgerAccount', () => {
  beforeEach(() => vi.resetAllMocks());

  it('removes deleted account caches and invalidates lists, descendants, posting accounts and draft journals', async () => {
    vi.mocked(ledgerAccountService.deleteLedgerAccount).mockResolvedValue(
      undefined
    );
    const { result, queryClient, removedKeys, refreshedKeys } = setup();
    await act(async () => {
      await result.current.mutateAsync('account-1');
    });
    expect(
      ledgerAccountService.deleteLedgerAccount
    ).toHaveBeenCalledExactlyOnceWith('account-1');
    for (const key of removedKeys) {
      expect(queryClient.getQueryData(key)).toBeUndefined();
    }

    for (const key of refreshedKeys) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }

    expect(queryClient.getQueryState(['unrelated'])?.isInvalidated).toBe(false);
  });

  it('retains cached records when deletion is rejected', async () => {
    const error = new Error('Deletion rejected');
    vi.mocked(ledgerAccountService.deleteLedgerAccount).mockRejectedValue(
      error
    );
    const { result, queryClient, removedKeys, refreshedKeys } = setup();
    await act(async () => {
      await expect(result.current.mutateAsync('account-1')).rejects.toBe(error);
    });
    for (const key of [...removedKeys, ...refreshedKeys]) {
      expect(queryClient.getQueryData(key)).toEqual({ cached: true });
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
  });
});
