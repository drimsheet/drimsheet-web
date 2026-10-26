import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import { drimsheetApi } from '@/shared/lib/api';
import type { TJournalEntryRectificationReq } from '@/shared/lib/api/Api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: {
    journalEntries: {
      deleteJournalEntry: vi.fn(),
      getJournalEntry: vi.fn(),
      getJournalEntries: vi.fn(),
      rectifyJournalEntry: vi.fn(),
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

  it('delegates rectification to the generated operation', async () => {
    const payload = {
      attachments: [],
      effectiveDate: '2026-09-21',
      postedAt: null,
      memo: null,
      sourceType: 'payment',
      sourceLine: {
        accountId: 'cash',
        counterparty: { name: 'Vendor' },
        amount: { amount: 1, currencyCode: 'NGN', isMinorUnit: false },
        exchangeRate: null,
        description: null,
        sequenceOrder: 1,
      },
      destinationLines: [],
    } satisfies TJournalEntryRectificationReq;

    vi.mocked(
      drimsheetApi.journalEntries.rectifyJournalEntry
    ).mockResolvedValue({
      data: { currentJournalEntryId: 'entry-1' },
    } as never);

    await journalEntryService.rectifyJournalEntry('entry-1', payload);

    expect(
      drimsheetApi.journalEntries.rectifyJournalEntry
    ).toHaveBeenCalledWith('entry-1', payload);
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
