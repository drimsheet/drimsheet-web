const DB_NAME = 'drimsheet-db';

export const EDbStoreName = { Records: 'records' } as const;

export type UDbStoreName = (typeof EDbStoreName)[keyof typeof EDbStoreName];

function connect(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('IndexedDB is unavailable'));

      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      for (const name of Object.values(EDbStoreName)) {
        request.result.createObjectStore(name, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function prune<T>(
  storeName?: UDbStoreName,
  shouldRemove?: (record: T) => boolean
): Promise<void> {
  const database = await connect();

  return new Promise((resolve, reject) => {
    const names = storeName
      ? [storeName]
      : Array.from(database.objectStoreNames);

    const transaction = database.transaction(names, 'readwrite');

    for (const name of names) {
      const request = transaction.objectStore(name).openCursor();

      request.onsuccess = () => {
        const cursor = request.result;

        if (!cursor) {
          return;
        }

        if (!shouldRemove || shouldRemove(cursor.value as T)) {
          cursor.delete();
        }

        cursor.continue();
      };
    }

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function transact<T>(
  storeName: UDbStoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await connect();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);

    // Close the connection even when creating the request throws (for example,
    // when a value cannot be cloned by IndexedDB).
    let request: IDBRequest<T>;

    try {
      request = operation(transaction.objectStore(storeName));
    } catch (error) {
      database.close();
      reject(error);

      return;
    }

    transaction.oncomplete = () => {
      database.close();
      resolve(request.result);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? request.error);
    };
  });
}

export const indexedDbService = Object.freeze({ connect, transact, prune });
