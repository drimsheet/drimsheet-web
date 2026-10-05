import type {
  IUserPreferencesUpdateDto,
  UAppThemePreference,
} from '@/shared/lib/api/Api';
import { userPreferencesQueryKey } from '@/user/hooks/use-preferences';
import { userService } from '@/user/lib/services/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theme: UAppThemePreference) => {
      const payload: IUserPreferencesUpdateDto = { theme };

      return userService.updatePreferences(payload);
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(userPreferencesQueryKey, preferences);
    },
  });
}
