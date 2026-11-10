import { journalEntryStorageService } from '@/journal-entries/lib/services/storage.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  records: new Map<string, unknown>(),
  getRecord: vi.fn(),
  setRecord: vi.fn(),
  removeRecord: vi.fn(),
}));

vi.mock('@/shared/lib/services/storage.service', () => ({
  storageService: mocks,
}));

describe('journalEntryStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.records.clear();
    mocks.getRecord.mockImplementation(async (key: string) =>
      mocks.records.get(key)
    );
    mocks.setRecord.mockImplementation(async (key: string, value: unknown) => {
      mocks.records.set(key, value);
    });
    mocks.removeRecord.mockImplementation(async (key: string) => {
      mocks.records.delete(key);
    });
  });

  it('stores the entire continuation with a one-day expiry and removes it when completed', async () => {
    const values = {
      amount: Number.NaN,
      attachments: [new File(['receipt'], 'receipt.pdf')],
    };

    const beforeSave = Date.now();

    await journalEntryStorageService.saveContinuation(
      'user:u:entity:e:journal-entries',
      'inflow',
      'draft',
      values
    );

    expect(
      await journalEntryStorageService.loadContinuation(
        'user:u:entity:e:journal-entries',
        'inflow',
        'draft'
      )
    ).toEqual(values);
    expect(mocks.setRecord.mock.calls[0][2]).toBeGreaterThanOrEqual(
      beforeSave + 24 * 60 * 60 * 1000
    );

    await journalEntryStorageService.removeContinuation(
      'user:u:entity:e:journal-entries',
      'inflow',
      'draft'
    );
    expect(
      await journalEntryStorageService.loadContinuation(
        'user:u:entity:e:journal-entries',
        'inflow',
        'draft'
      )
    ).toBeUndefined();
  });

  it.each(['outflow', 'transfer'] as const)(
    'restores a file from a %s continuation saved before the attachment list',
    async (type) => {
      const attachment = new File(['receipt'], 'receipt.pdf');

      await journalEntryStorageService.saveContinuation(
        'scope',
        type,
        'draft',
        {
          description: 'Office supplies',
          attachment,
        }
      );

      await expect(
        journalEntryStorageService.loadContinuation('scope', type, 'draft')
      ).resolves.toEqual({
        description: 'Office supplies',
        attachments: [attachment],
      });
    }
  );

  it('isolates continuations by scope, transaction type, and tab session', async () => {
    await journalEntryStorageService.saveContinuation(
      'scope-a',
      'inflow',
      'draft',
      { description: 'First' }
    );
    await journalEntryStorageService.saveContinuation(
      'scope-b',
      'inflow',
      'draft',
      { description: 'Other entity' }
    );
    await journalEntryStorageService.saveContinuation(
      'scope-a',
      'transfer',
      'draft',
      { description: 'Transfer' }
    );

    expect(
      await journalEntryStorageService.loadContinuation(
        'scope-a',
        'inflow',
        'draft'
      )
    ).toEqual({ description: 'First' });
    expect(
      await journalEntryStorageService.loadContinuation(
        'scope-b',
        'inflow',
        'draft'
      )
    ).toEqual({ description: 'Other entity' });
    expect(
      await journalEntryStorageService.loadContinuation(
        'scope-a',
        'transfer',
        'draft'
      )
    ).toEqual({ description: 'Transfer' });

    sessionStorage.clear();
    expect(
      await journalEntryStorageService.loadContinuation(
        'scope-a',
        'inflow',
        'draft'
      )
    ).toBeUndefined();
  });
});
