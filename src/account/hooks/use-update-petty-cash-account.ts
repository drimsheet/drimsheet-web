import { useRefreshUpdatedAccount } from '@/account/hooks/use-refresh-updated-account';
import { assetAccountService } from '@/account/lib/services/asset-account.service';
import type { IPettyCashAccountUpdateReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useUpdatePettyCashAccount(id: string) {
  const onSuccess = useRefreshUpdatedAccount();

  return useMutation({
    mutationFn: (request: IPettyCashAccountUpdateReq) =>
      assetAccountService.updatePettyCashAccount(id, request),
    onSuccess,
  });
}
