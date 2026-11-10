import { authService } from '@/auth/lib/services/auth.service';
import { StorageScopeContext } from '@/shared/hooks/use-scoped-key';
import { observabilityService } from '@/shared/lib/services/observability.service';
import { storageService } from '@/shared/lib/services/storage.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';

export function useLogout() {
  const queryClient = useQueryClient();
  const scope = useContext(StorageScopeContext);

  async function prune() {
    if (scope?.userId) {
      await storageService
        .prune(`user:${encodeURIComponent(scope.userId)}:`)
        .catch((error: unknown) => {
          observabilityService.report(
            error instanceof Error
              ? error
              : new Error('Storage cleanup failed'),
            { source: 'storage' }
          );
        });
    }
  }

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      await prune();
      queryClient.clear();
    },
  });
}
