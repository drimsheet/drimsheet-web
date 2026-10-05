import {
  EAppThemePreference,
  EAppUsageModePreference,
  type IUserPreferences,
  type TEntityId,
} from '@/shared/lib/api/Api';
import { userPreferencesQueryKey } from '@/user/hooks/use-preferences';
import { useUpdatePreferences } from '@/user/hooks/use-update-preferences';
import { userService } from '@/user/lib/services/user.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/user/lib/services/user.service', () => ({
  userService: {
    updatePreferences: vi.fn(),
  },
}));

const preferences = {
  userId: '00000000-0000-4000-8000-000000000001' as TEntityId,
  createdBy: '00000000-0000-4000-8000-000000000001' as TEntityId,
  lastActiveAccountingEntityId: null,
  appPreferences: {
    theme: EAppThemePreference.Light,
    appUsageMode: EAppUsageModePreference.PowerUser,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-19T00:00:00.000Z',
} satisfies IUserPreferences;

describe('useUpdatePreferences', () => {
  it('maps the theme, updates preferences, and replaces the cached resource', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    vi.mocked(userService.updatePreferences).mockResolvedValue(preferences);

    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdatePreferences(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(EAppThemePreference.Light);
    });

    expect(userService.updatePreferences).toHaveBeenCalledWith({
      theme: EAppThemePreference.Light,
    });
    expect(queryClient.getQueryData(userPreferencesQueryKey)).toEqual(
      preferences
    );
  });
});
