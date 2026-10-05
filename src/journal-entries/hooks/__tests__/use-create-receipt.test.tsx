import { useCreateReceipt } from '@/journal-entries/hooks/use-create-receipt';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type { IReceiptEntryReq } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { createReceipt: vi.fn() },
}));

const payload: IReceiptEntryReq = {
  attachmentReferences: ['attachment-reference-1'],
  sourceLines: [
    {
      accountId: 'sales',
      counterparty: { name: 'Payer' },
      amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
      exchangeRate: null,
      description: null,
      sequenceOrder: 1,
    },
  ],
  destinationLine: {
    accountId: 'bank',
    counterparty: { name: 'Payer' },
    amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    description: null,
    sequenceOrder: 2,
  },
  effectiveDate: '2026-08-10',
  postedAt: '2026-08-12T10:30:00.000Z',
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

describe('useCreateReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(journalEntryService.createReceipt).mockResolvedValue({} as never);
  });

  it('forwards the generated receipt payload unchanged', async () => {
    const { result } = renderHook(() => useCreateReceipt(), {
      wrapper: createWrapper(),
    });

    await act(async () => result.current.mutateAsync(payload));

    expect(journalEntryService.createReceipt).toHaveBeenCalledOnce();
    expect(journalEntryService.createReceipt).toHaveBeenCalledWith(payload);
  });

  it('propagates service errors', async () => {
    const error = new Error('Receipt creation failed');
    vi.mocked(journalEntryService.createReceipt).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateReceipt(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => result.current.mutateAsync(payload))
    ).rejects.toBe(error);
  });
});
