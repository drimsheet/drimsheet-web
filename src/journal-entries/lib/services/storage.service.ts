import type { UTransactionCreationType } from '@/journal-entries/lib/types/transaction-continuation.types';
import { storageService } from '@/shared/lib/services/storage.service';

const sessionKey = 'drimsheet-storage-session';
const continuationLifetime = 24 * 60 * 60 * 1000;

function continuationRecordKey(
  scopedKey: string,
  type: UTransactionCreationType,
  key: string
) {
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(sessionKey, sessionId);
  }

  return `${scopedKey}:continuation:${sessionId}:${type}:${encodeURIComponent(key)}`;
}

export const journalEntryStorageService = {
  async loadContinuation<T extends object>(
    scopedKey: string,
    type: UTransactionCreationType,
    key: string
  ) {
    // TODO: version continuation payloads when transaction form contracts change.
    const values = await storageService.getRecord<T>(
      continuationRecordKey(scopedKey, type, key)
    );

    if (values && !('attachments' in values) && 'attachment' in values) {
      const { attachment, ...fields } = values;

      return {
        ...fields,
        attachments: attachment instanceof File ? [attachment] : [],
      } as T;
    }

    return values;
  },

  saveContinuation<T>(
    scopedKey: string,
    type: UTransactionCreationType,
    key: string,
    values: T
  ) {
    return storageService.setRecord(
      continuationRecordKey(scopedKey, type, key),
      values,
      Date.now() + continuationLifetime
    );
  },

  removeContinuation(
    scopedKey: string,
    type: UTransactionCreationType,
    key: string
  ) {
    return storageService.removeRecord(
      continuationRecordKey(scopedKey, type, key)
    );
  },
};
