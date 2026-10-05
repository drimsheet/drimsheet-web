import { useCreateTransfer } from '@/journal-entries/hooks/use-create-transfer';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type { ITransferEntryReq } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { createTransfer: vi.fn() },
}));

const payload: ITransferEntryReq = {
  attachmentReferences: ['attachment-reference-1'],
  sourceLine: {
    accountId: 'bank',
    amount: { amount: 105, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    description: null,
    sequenceOrder: 1,
  },
  destinationLine: {
    accountId: 'petty-cash',
    amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    description: null,
    sequenceOrder: 2,
  },
  chargeLines: [
    {
      accountId: 'bank-fees',
      counterparty: null,
      amount: { amount: 5, currencyCode: 'NGN', isMinorUnit: false },
      exchangeRate: null,
      description: 'Transfer fee',
      sequenceOrder: 3,
    },
  ],
  effectiveDate: '2026-08-30',
  postedAt: '2026-08-30T12:00:00.000Z',
  memo: null,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreateTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(journalEntryService.createTransfer).mockResolvedValue(
      {} as never
    );
  });

  it('forwards the generated transfer payload unchanged', async () => {
    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => result.current.mutateAsync(payload));

    expect(journalEntryService.createTransfer).toHaveBeenCalledOnce();
    expect(journalEntryService.createTransfer).toHaveBeenCalledWith(payload);
  });

  it('propagates service errors', async () => {
    const error = new Error('Transfer creation failed');
    vi.mocked(journalEntryService.createTransfer).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => result.current.mutateAsync(payload))
    ).rejects.toBe(error);
  });
});
