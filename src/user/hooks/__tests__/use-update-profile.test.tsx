import type { IUserProfileDto, TEntityId } from '@/shared/lib/api/Api';
import { userProfileQueryKey } from '@/user/hooks/use-profile';
import { useUpdateProfile } from '@/user/hooks/use-update-profile';
import { userService } from '@/user/lib/services/user.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/user/lib/services/user.service', () => ({
  userService: { updateProfile: vi.fn() },
}));

const profile: IUserProfileDto = {
  id: '00000000-0000-4000-8000-000000000001' as TEntityId,
  email: 'amara@example.com',
  emailVerified: true,
  firstName: 'Amara',
  lastName: 'Okafor',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useUpdateProfile', () => {
  it('replaces the cached profile with the canonical response', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    client.setQueryData(userProfileQueryKey, profile);

    const savedProfile = {
      ...profile,
      firstName: 'Ada',
      updatedAt: '2026-10-16T00:00:00Z',
    };

    vi.mocked(userService.updateProfile).mockResolvedValue(savedProfile);

    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ firstName: 'Ada' });
    });

    expect(userService.updateProfile).toHaveBeenCalledWith({
      firstName: 'Ada',
    });
    expect(client.getQueryData(userProfileQueryKey)).toEqual(savedProfile);
  });

  it('keeps the saved profile when the update fails', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    client.setQueryData(userProfileQueryKey, profile);
    vi.mocked(userService.updateProfile).mockRejectedValue(
      new Error('Request failed')
    );

    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ firstName: 'Ada' })
      ).rejects.toThrow('Request failed');
    });

    expect(client.getQueryData(userProfileQueryKey)).toEqual(profile);
  });
});
