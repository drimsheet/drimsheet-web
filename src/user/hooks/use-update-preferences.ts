import type { IUserPreferencesUpdateDto } from '@/shared/lib/api/Api';
import { userPreferencesQueryKey } from '@/user/hooks/use-preferences';
import { userService } from '@/user/lib/services/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUserPreferencesUpdateDto) =>
      userService.updatePreferences(payload),
    onSuccess: (preferences) => {
      queryClient.setQueryData(userPreferencesQueryKey, preferences);
    },
  });
}
