import { drimsheetApi } from '@/shared/lib/api';
import type { IUserPreferencesUpdateDto } from '@/shared/lib/api/Api';
import { storageService } from '@/shared/lib/services/storage.service';

export const userService = {
  async getProfile() {
    const res = await drimsheetApi.users.getAuthUserProfile();

    return res.data;
  },

  async getPreferences() {
    const res = await drimsheetApi.users.getUserPreferences();
    storageService.set({ preferences: res.data });

    return res.data;
  },

  async updatePreferences(payload: IUserPreferencesUpdateDto) {
    const res = await drimsheetApi.users.updateUserPreferences(payload);
    storageService.set({ preferences: res.data });

    return res.data;
  },
};
