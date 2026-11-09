import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import { drimsheetApi } from '@/shared/lib/api';
import type {
  IPaymentEntryReq,
  IReceiptEntryReq,
  ITransferEntryReq,
} from '@/shared/lib/api/Api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: {
    journalEntries: {
      deleteJournalEntry: vi.fn(),
      getJournalEntry: vi.fn(),
      getJournalEntries: vi.fn(),
      updateJournalEntryMeta: vi.fn(),
      updateDraftPayment: vi.fn(),
      updateDraftReceipt: vi.fn(),
      updateDraftTransfer: vi.fn(),
      voidAndReplacePayment: vi.fn(),
      voidAndReplaceReceipt: vi.fn(),
      voidAndReplaceTransfer: vi.fn(),
    },
  },
}));

describe('journalEntryService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches a journal entry through the generated detail operation', async () => {
    vi.mocked(drimsheetApi.journalEntries.getJournalEntry).mockResolvedValue({
      data: { id: 'entry-1' },
    } as never);

    await expect(
      journalEntryService.getJournalEntry('entry-1')
    ).resolves.toEqual({ id: 'entry-1' });
    expect(drimsheetApi.journalEntries.getJournalEntry).toHaveBeenCalledWith(
      'entry-1'
    );
  });

  it('delegates deletion to the generated operation', async () => {
    vi.mocked(drimsheetApi.journalEntries.deleteJournalEntry).mockResolvedValue(
      {
        data: undefined,
      } as never
    );

    await journalEntryService.deleteJournalEntry('entry-1');

    expect(drimsheetApi.journalEntries.deleteJournalEntry).toHaveBeenCalledWith(
      'entry-1'
    );
  });

  it.each([
    ['rectifyPayment', 'updateDraftPayment'],
    ['rectifyReceipt', 'updateDraftReceipt'],
    ['rectifyTransfer', 'updateDraftTransfer'],
  ] as const)(
    'sends %s draft edits to the matching draft endpoint',
    async (rectifyMethod, updateMethod) => {
      const api = drimsheetApi.journalEntries;
      vi.mocked(api[updateMethod]).mockResolvedValue({
        data: { id: 'entry-1' },
      } as never);
      const patch = { attachments: { add: ['upload-ref'] }, memo: 'Draft' };

      await expect(
        journalEntryService[rectifyMethod]('entry-1', {
          action: 'updateDraft',
          payload: patch,
        })
      ).resolves.toEqual({ id: 'entry-1' });
      expect(api[updateMethod]).toHaveBeenCalledWith('entry-1', patch);
      expect(api[updateMethod]).toHaveBeenCalledOnce();
    }
  );

  it('delegates memo and line descriptions to the metadata operation', async () => {
    const operation = drimsheetApi.journalEntries.updateJournalEntryMeta;
    vi.mocked(operation).mockResolvedValue({
      data: { id: 'entry-1' },
    } as never);

    const patch = {
      header: { memo: null },
      lines: [{ id: 'line-1', description: 'Edited' }],
    };

    await expect(
      journalEntryService.rectifyPayment('entry-1', {
        action: 'updateMeta',
        payload: patch,
      })
    ).resolves.toEqual({ id: 'entry-1' });
    expect(operation).toHaveBeenCalledWith('entry-1', patch);
  });

  it('returns the replacement journal for each source-specific correction', async () => {
    const line = {
      accountId: 'cash',
      counterpartyId: 'counterparty-1',
      amount: { amount: 1, currencyCode: 'NGN', isMinorUnit: false },
      exchangeRate: null,
      description: null,
      sequenceOrder: 1,
    };

    const header = { effectiveDate: '2026-09-21', postedAt: null, memo: null };

    const payment = {
      ...header,
      sourceLine: line,
      destinationLines: [line],
    } satisfies IPaymentEntryReq;

    const receipt = {
      ...header,
      sourceLines: [line],
      destinationLine: line,
    } satisfies IReceiptEntryReq;

    const transfer = {
      ...header,
      sourceLine: line,
      destinationLine: line,
      chargeLines: [line],
    } satisfies ITransferEntryReq;

    const replacement = { id: 'replacement-1' };

    const {
      voidAndReplacePayment,
      voidAndReplaceReceipt,
      voidAndReplaceTransfer,
    } = drimsheetApi.journalEntries;

    vi.mocked(voidAndReplacePayment).mockResolvedValue({
      data: replacement,
    } as never);
    vi.mocked(voidAndReplaceReceipt).mockResolvedValue({
      data: replacement,
    } as never);
    vi.mocked(voidAndReplaceTransfer).mockResolvedValue({
      data: replacement,
    } as never);

    await expect(
      journalEntryService.rectifyPayment('entry-1', {
        action: 'voidAndReplace',
        payload: payment,
      })
    ).resolves.toEqual(replacement);
    await expect(
      journalEntryService.rectifyReceipt('entry-1', {
        action: 'voidAndReplace',
        payload: receipt,
      })
    ).resolves.toEqual(replacement);
    await expect(
      journalEntryService.rectifyTransfer('entry-1', {
        action: 'voidAndReplace',
        payload: transfer,
      })
    ).resolves.toEqual(replacement);
    expect(voidAndReplacePayment).toHaveBeenCalledWith('entry-1', payment);
    expect(voidAndReplaceReceipt).toHaveBeenCalledWith('entry-1', receipt);
    expect(voidAndReplaceTransfer).toHaveBeenCalledWith('entry-1', transfer);
  });
});

it('forwards the complete journal query and cancellation signal', async () => {
  const query = { accountId: 'account-1', page: 2, limit: 100 };
  const signal = new AbortController().signal;

  const response = {
    data: [],
    meta: { page: 2, limit: 100, total: 0, totalPages: 0 },
  };

  vi.mocked(drimsheetApi.journalEntries.getJournalEntries).mockResolvedValue({
    data: response,
  } as never);
  await expect(
    journalEntryService.getJournalEntries(query, signal)
  ).resolves.toEqual(response);
  expect(drimsheetApi.journalEntries.getJournalEntries).toHaveBeenCalledWith(
    query,
    { signal }
  );
});
