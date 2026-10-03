import { drimsheetApi } from '@/shared/lib/api';
import {
  EAppThemePreference,
  EAppUsageModePreference,
  type IUserPreferences,
  type IUserPreferencesUpdateDto,
  type TEntityId,
} from '@/shared/lib/api/Api';
import { userService } from '@/user/lib/services/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: {
    users: {
      getAuthUserProfile: vi.fn(),
      getUserPreferences: vi.fn(),
      updateUserPreferences: vi.fn(),
    },
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

describe('userService preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns and stores fetched preferences', async () => {
    vi.mocked(drimsheetApi.users.getUserPreferences).mockResolvedValue({
      data: preferences,
    } as never);

    await expect(userService.getPreferences()).resolves.toEqual(preferences);
    expect(localStorage.getItem('preferences')).toBe(
      JSON.stringify(preferences)
    );
  });

  it('delegates an update and stores the canonical returned preferences', async () => {
    const payload = {
      theme: EAppThemePreference.Light,
    } satisfies IUserPreferencesUpdateDto;
    vi.mocked(drimsheetApi.users.updateUserPreferences).mockResolvedValue({
      data: preferences,
    } as never);

    await expect(userService.updatePreferences(payload)).resolves.toEqual(
      preferences
    );
    expect(drimsheetApi.users.updateUserPreferences).toHaveBeenCalledWith(
      payload
    );
    expect(localStorage.getItem('preferences')).toBe(
      JSON.stringify(preferences)
    );
  });
});
