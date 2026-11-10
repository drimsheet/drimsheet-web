import type { IStorageScope } from '@/shared/lib/types/storage.types';
import { createContext, useContext } from 'react';

export const StorageScopeContext = createContext<IStorageScope | undefined>(
  undefined
);

export function useScopedKey(key: string) {
  const scope = useContext(StorageScopeContext);

  if (!scope?.userId || !scope.accountingEntityId) {
    return undefined;
  }

  return `user:${encodeURIComponent(scope.userId)}:entity:${encodeURIComponent(scope.accountingEntityId)}:${key}`;
}
