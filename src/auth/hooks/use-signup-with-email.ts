import { authService } from '@/auth/lib/services/auth.service';
import type { IUserSignupReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useSignupWithEmail() {
  return useMutation({
    mutationFn: async (payload: IUserSignupReq) => {
      await authService.signupWithEmail(payload);
    },
  });
}
