import { userService } from '@/user/lib/services/user.service';
import { useQuery } from '@tanstack/react-query';

export const userProfileQueryKey = ['userService', 'getProfile'] as const;

interface IUseProfileOptions {
  enabled?: boolean;
}

export function useProfile({ enabled = true }: IUseProfileOptions = {}) {
  return useQuery({
    queryKey: userProfileQueryKey,
    queryFn: () => userService.getProfile(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
