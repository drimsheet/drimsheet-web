import { useRefreshUpdatedAccount } from '@/account/hooks/use-refresh-updated-account';
import { assetAccountService } from '@/account/lib/services/asset-account.service';
import type { IBankAccountUpdateReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useUpdateBankAccount(id: string) {
  const onSuccess = useRefreshUpdatedAccount();

  return useMutation({
    mutationFn: (request: IBankAccountUpdateReq) =>
      assetAccountService.updateBankAccount(id, request),
    onSuccess,
  });
}
