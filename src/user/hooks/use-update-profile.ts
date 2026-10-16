import type { IUserProfileUpdateDto } from '@/shared/lib/api/Api';
import { userProfileQueryKey } from '@/user/hooks/use-profile';
import { userService } from '@/user/lib/services/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUserProfileUpdateDto) =>
      userService.updateProfile(payload),
    onSuccess: async (profile) => {
      await queryClient.cancelQueries({ queryKey: userProfileQueryKey });
      queryClient.setQueryData(userProfileQueryKey, profile);
    },
  });
}
