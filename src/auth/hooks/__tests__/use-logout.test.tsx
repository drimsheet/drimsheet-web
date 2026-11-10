import { useLogout } from '@/auth/hooks/use-logout';
import { authService } from '@/auth/lib/services/auth.service';
import { StorageScopeContext } from '@/shared/hooks/use-scoped-key';
import { storageService } from '@/shared/lib/services/storage.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth/lib/services/auth.service', () => ({
  authService: { logout: vi.fn() },
}));

function setup() {
  const client = new QueryClient();
  client.setQueryData(['current-user'], { id: 'user-1' });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <StorageScopeContext.Provider
          value={{ userId: 'user-1', accountingEntityId: 'entity-1' }}
        >
          {children}
        </StorageScopeContext.Provider>
      </QueryClientProvider>
    );
  }

  return { client, ...renderHook(() => useLogout(), { wrapper: Wrapper }) };
}

describe('useLogout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('prunes the current user records only after logout succeeds, then clears the query cache', async () => {
    let completeLogout!: () => void;
    vi.mocked(authService.logout).mockReturnValue(
      new Promise<void>((resolve) => {
        completeLogout = resolve;
      })
    );

    const prune = vi
      .spyOn(storageService, 'prune')
      .mockResolvedValue(undefined);

    const { result, client } = setup();
    expect(prune).not.toHaveBeenCalled();

    let logout!: Promise<void>;
    await act(async () => {
      logout = result.current.mutateAsync();
    });
    expect(authService.logout).toHaveBeenCalledOnce();
    expect(prune).not.toHaveBeenCalled();
    expect(client.getQueryData(['current-user'])).toEqual({ id: 'user-1' });

    await act(async () => {
      completeLogout();
      await logout;
    });

    expect(prune).toHaveBeenCalledExactlyOnceWith('user:user-1:');
    expect(client.getQueryData(['current-user'])).toBeUndefined();
  });

  it('preserves storage and cached data when logout fails', async () => {
    vi.mocked(authService.logout).mockRejectedValue(new Error('Logout failed'));

    const prune = vi
      .spyOn(storageService, 'prune')
      .mockResolvedValue(undefined);

    const { result, client } = setup();

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow(
        'Logout failed'
      );
    });

    expect(prune).not.toHaveBeenCalled();
    expect(client.getQueryData(['current-user'])).toEqual({ id: 'user-1' });
  });
});
