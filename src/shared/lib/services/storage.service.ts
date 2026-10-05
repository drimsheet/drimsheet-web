import {
  EAppThemePreference,
  type IUserPreferences,
  type TEntityId,
  type UAppThemePreference,
} from '@/shared/lib/api/Api';

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
