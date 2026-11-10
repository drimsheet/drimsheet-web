import { authService } from '@/auth/lib/services/auth.service';
import { drimsheetApi } from '@/shared/lib/api';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('authService.logout', () => {
  afterEach(() => vi.restoreAllMocks());

  it('clears authentication after successful logout', async () => {
    vi.spyOn(drimsheetApi.auth, 'logout').mockResolvedValue({} as never);

    authService.setToken('test-token');

    await authService.logout();

    expect(authService.isLoggedIn()).toBe(false);
  });

  it('retains authentication when logout fails', async () => {
    vi.spyOn(drimsheetApi.auth, 'logout').mockRejectedValue(
      new Error('Request failed')
    );

    authService.setToken('test-token');

    await expect(authService.logout()).rejects.toThrow('Request failed');

    expect(authService.isLoggedIn()).toBe(true);
    authService.removeToken();
  });
});
