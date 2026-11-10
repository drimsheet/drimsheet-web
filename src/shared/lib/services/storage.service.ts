import { EDbStoreName, indexedDbService } from '@/shared/db/indexed-db';
import {
  EAppThemePreference,
  type IUserPreferences,
  type TEntityId,
  type UAppThemePreference,
} from '@/shared/lib/api/Api';
import type { IStorageRecord } from '@/shared/lib/types/storage.types';

export interface IStorageState {
  accountingEntityId: TEntityId;
  isLoggedIn: boolean;
  preferences: IUserPreferences;
  theme: UAppThemePreference;
}

const storageKeys: Record<keyof IStorageState, string> = Object.freeze({
  accountingEntityId: 'accounting-entity-id',
  isLoggedIn: 'isLoggedIn',
  preferences: 'preferences',
  theme: 'theme',
});

function deserialize<K extends keyof IStorageState>(
  key: K,
  value: string
): IStorageState[K] | undefined {
  switch (key) {
    case 'accountingEntityId':
      return value as IStorageState[K];
    case 'isLoggedIn':
      return (value === 'true') as IStorageState[K];
    case 'preferences':
      try {
        return JSON.parse(value) as IStorageState[K];
      } catch {
        return undefined;
      }

    case 'theme': {
      const themes: string[] = Object.values(EAppThemePreference);

      return themes.includes(value) ? (value as IStorageState[K]) : undefined;
    }
  }
}

function serialize<K extends keyof IStorageState>(
  key: K,
  value: IStorageState[K]
): string {
  return key === 'preferences' ? JSON.stringify(value) : String(value);
}

export const storageService = {
  async getRecord<T>(key: string): Promise<T | undefined> {
    const record: IStorageRecord<T> | undefined =
      await indexedDbService.transact(
        EDbStoreName.Records,
        'readonly',
        (store) => store.get(key)
      );

    if (
      !record ||
      (record.expiresAt !== undefined && record.expiresAt <= Date.now())
    ) {
      return undefined;
    }

    return record.value;
  },

  async setRecord<T>(key: string, value: T, expiresAt?: number) {
    await indexedDbService.transact(
      EDbStoreName.Records,
      'readwrite',
      (store) =>
        store.put({ id: key, value, expiresAt } satisfies IStorageRecord<T>)
    );
  },

  async removeRecord(key: string) {
    await indexedDbService.transact(
      EDbStoreName.Records,
      'readwrite',
      (store) => store.delete(key)
    );
  },

  async prune(prefix?: string) {
    await indexedDbService.prune<IStorageRecord>(
      EDbStoreName.Records,
      (record) => {
        if (prefix !== undefined) {
          return record.id.startsWith(prefix);
        }

        return record.expiresAt !== undefined && record.expiresAt <= Date.now();
      }
    );
  },

  get<K extends keyof IStorageState>(key: K): IStorageState[K] | undefined {
    const storedValue = localStorage.getItem(storageKeys[key]);

    return storedValue === null ? undefined : deserialize(key, storedValue);
  },

  set(values: Partial<IStorageState>) {
    for (const key of Object.keys(values) as Array<keyof IStorageState>) {
      const value = values[key];
      if (value === undefined) {
        localStorage.removeItem(storageKeys[key]);
        continue;
      }

      localStorage.setItem(storageKeys[key], serialize(key, value));
    }
  },
};
