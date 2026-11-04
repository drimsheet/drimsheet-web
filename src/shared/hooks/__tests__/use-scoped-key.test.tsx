import {
  StorageScopeContext,
  useScopedKey,
} from '@/shared/hooks/use-scoped-key';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

describe('useScopedKey', () => {
  it('prepends the current user and entity to arbitrary keys', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <StorageScopeContext.Provider
          value={{ userId: 'user:1', accountingEntityId: 'entity/1' }}
        >
          {children}
        </StorageScopeContext.Provider>
      );
    }

    const { result, rerender } = renderHook(({ key }) => useScopedKey(key), {
      wrapper: Wrapper,
      initialProps: { key: 'journal-entries' },
    });

    expect(result.current).toBe(
      'user:user%3A1:entity:entity%2F1:journal-entries'
    );
    rerender({ key: 'another-record' });
    expect(result.current).toBe(
      'user:user%3A1:entity:entity%2F1:another-record'
    );
  });

  it('does not provide an unscoped fallback while identity is unavailable', () => {
    const { result } = renderHook(() => useScopedKey('journal-entries'));
    expect(result.current).toBeUndefined();
  });
});
