import { useUpdateBankAccount } from '@/account/hooks/use-update-bank-account';
import { useUpdatePettyCashAccount } from '@/account/hooks/use-update-petty-cash-account';
import { assetAccountService } from '@/account/lib/services/asset-account.service';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/asset-account.service', () => ({
  assetAccountService: {
    updateBankAccount: vi.fn(),
    updatePettyCashAccount: vi.fn(),
  },
}));

for (const [useUpdate, method] of [
  [useUpdateBankAccount, 'updateBankAccount'],
  [useUpdatePettyCashAccount, 'updatePettyCashAccount'],
] as const) {
  describe(method, () => {
    beforeEach(() => vi.resetAllMocks());
    it('updates detail data and invalidates account and transaction caches', async () => {
      const client = new QueryClient();

      const detailKey = [
        'ledgerAccountService',
        'getLedgerAccount',
        'account-1',
      ];

      const keys = [
        ['reportingService', 'getLedgerBalancesByCurrency'],
        ['reportingService', 'getBalancesBySubType'],
        detailKey,
        ['ledgerAccountService', 'getBankDetails', 'account-1'],
        ['ledgerAccountService', 'getLedgerAccounts'],
        ['ledgerAccountService', 'getPermittedPostingAccounts'],
        ['journalEntryService', 'getJournalEntries'],
      ];

      keys.forEach((key) => client.setQueryData(key, { name: 'Old name' }));

      const updated = {
        id: 'account-1',
        name: 'Updated name',
      } as ILedgerAccountDto;

      vi.mocked(assetAccountService[method]).mockResolvedValue(updated);

      const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdate('account-1'), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({ name: 'Updated name' });
      });
      expect(assetAccountService[method]).toHaveBeenCalledExactlyOnceWith(
        'account-1',
        { name: 'Updated name' }
      );
      expect(client.getQueryData(detailKey)).toEqual(updated);
      keys.forEach((key) =>
        expect(client.getQueryState(key)?.isInvalidated).toBe(true)
      );
    });
  });
}
