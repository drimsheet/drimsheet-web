import { useCreatePayment } from '@/journal-entries/hooks/use-create-payment';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import type { IPaymentEntryReq } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { createPayment: vi.fn() },
}));

const payload: IPaymentEntryReq = {
  attachmentReferences: ['attachment-reference-1'],
  sourceLine: {
    accountId: 'bank',
    counterparty: { name: 'Recipient' },
    amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    description: null,
    sequenceOrder: 1,
  },
  destinationLines: [
    {
      accountId: 'expense',
      counterparty: { name: 'Recipient' },
      amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
      exchangeRate: null,
      description: null,
      sequenceOrder: 2,
    },
  ],
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

describe('useCreatePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(journalEntryService.createPayment).mockResolvedValue({} as never);
  });

  it('forwards the generated payment payload unchanged', async () => {
    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: createWrapper(),
    });

    await act(async () => result.current.mutateAsync(payload));

    expect(journalEntryService.createPayment).toHaveBeenCalledOnce();
    expect(journalEntryService.createPayment).toHaveBeenCalledWith(payload);
  });

  it('propagates service errors', async () => {
    const error = new Error('Payment creation failed');
    vi.mocked(journalEntryService.createPayment).mockRejectedValue(error);

    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => result.current.mutateAsync(payload))
    ).rejects.toBe(error);
  });
});
