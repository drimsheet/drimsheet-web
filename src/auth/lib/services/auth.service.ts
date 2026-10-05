import type { ISignupFormValues } from '@/auth/components/signup-form/types';
import { drimsheetApi } from '@/shared/lib/api';
import type {
  IEmailLoginReq,
  IResetPasswordReq,
  IUserProfileDto,
} from '@/shared/lib/api/Api';
import { storageService } from '@/shared/lib/services/storage.service';
import { jwtDecode } from 'jwt-decode';

let accessToken: string;
let refreshPromise: Promise<string> | null = null;

async function executeRefresh(): Promise<string> {
  try {
    const { data } = await drimsheetApi.auth.refreshAccessToken();
    authService.setToken(data.accessToken);

    return data.accessToken;
  } catch (error) {
    authService.removeToken();
    throw error;
  }
}

export const authService = {
  isLoggedIn() {
    return storageService.get('isLoggedIn') ?? false;
  },

  getToken() {
    return accessToken;
  },

  setToken(token: string) {
    storageService.set({ isLoggedIn: true });
    accessToken = token;
  },

  removeToken() {
    storageService.set({ isLoggedIn: undefined });
    accessToken = '';
  },

  async getAccessToken(): Promise<string> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.locks) {
          return await navigator.locks.request(
            'token_refresh_lock',
            executeRefresh
          );
        } else {
          return await executeRefresh();
        }
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  async init() {
    if (this.isLoggedIn() && !accessToken) {
      try {
        await this.getAccessToken();
      } catch (error) {
        console.error('Failed to get access token during init:', error);
      }
    }
  },

  async signupWithEmail(payload: ISignupFormValues) {
    return drimsheetApi.auth.signupWithEmail(payload);
  },

  async verifyEmail(token: string) {
    const response = await drimsheetApi.auth.verifyEmail({ token });
    this.setToken(response.data.accessToken);
  },

  async loginWithEmail(payload: IEmailLoginReq) {
    const response = await drimsheetApi.auth.loginWithEmail(payload);
    this.setToken(response.data.accessToken);
  },

  async requestPasswordReset(email: string) {
    await drimsheetApi.auth.getPasswordResetLink({ email });
  },

  async resetPassword(payload: IResetPasswordReq) {
    const response = await drimsheetApi.auth.resetPassword(payload);
    this.setToken(response.data.accessToken);
  },

  decodeToken(token?: string | null) {
    if (!token) return null;

    try {
      return jwtDecode(token) as IUserProfileDto;
    } catch {
      return null;
    }
  },

  async logout() {
    await drimsheetApi.auth.logout();
    this.removeToken();
  },
};
