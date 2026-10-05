import {
  EAppThemePreference,
  EAppUsageModePreference,
  type IUserPreferences,
  type TEntityId,
} from '@/shared/lib/api/Api';
import { storageService } from '@/shared/lib/services/storage.service';
import { beforeEach, describe, expect, it } from 'vitest';

const accountingEntityId = '00000000-0000-4000-8000-000000000002' as TEntityId;

const preferences = {
  userId: '00000000-0000-4000-8000-000000000001' as TEntityId,
  createdBy: '00000000-0000-4000-8000-000000000001' as TEntityId,
  lastActiveAccountingEntityId: accountingEntityId,
  appPreferences: {
    theme: EAppThemePreference.Light,
    appUsageMode: EAppUsageModePreference.PowerUser,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-19T00:00:00.000Z',
} satisfies IUserPreferences;

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and gets the logged-in state', () => {
    expect(storageService.get('isLoggedIn')).toBeUndefined();

    storageService.set({ isLoggedIn: true });
    expect(storageService.get('isLoggedIn')).toBe(true);

    storageService.set({ isLoggedIn: undefined });
    expect(storageService.get('isLoggedIn')).toBeUndefined();
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
  });

  it('sets and gets the color theme', () => {
    storageService.set({ theme: EAppThemePreference.Light });

    expect(storageService.get('theme')).toBe(EAppThemePreference.Light);
  });

  it('sets and gets canonical user preferences', () => {
    storageService.set({ preferences });

    expect(storageService.get('preferences')).toEqual(preferences);
  });

  it('saves multiple properties together', () => {
    storageService.set({
      accountingEntityId,
      theme: EAppThemePreference.Dark,
    });

    expect(storageService.get('accountingEntityId')).toBe(accountingEntityId);
    expect(storageService.get('theme')).toBe(EAppThemePreference.Dark);
  });

  it('sets, gets, and removes the accounting entity ID', () => {
    storageService.set({ accountingEntityId });
    expect(storageService.get('accountingEntityId')).toBe(accountingEntityId);

    storageService.set({ accountingEntityId: undefined });
    expect(storageService.get('accountingEntityId')).toBeUndefined();
  });

  it('returns undefined for invalid stored values', () => {
    localStorage.setItem('theme', 'invalid');
    localStorage.setItem('preferences', 'invalid');

    expect(storageService.get('theme')).toBeUndefined();
    expect(storageService.get('preferences')).toBeUndefined();
  });
});
