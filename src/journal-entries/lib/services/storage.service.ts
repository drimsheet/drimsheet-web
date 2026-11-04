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
  loadContinuation<T>(
    scopedKey: string,
    type: UTransactionCreationType,
    key: string
  ) {
    // TODO: version continuation payloads when transaction form contracts change.
    return storageService.getRecord<T>(
      continuationRecordKey(scopedKey, type, key)
    );
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
