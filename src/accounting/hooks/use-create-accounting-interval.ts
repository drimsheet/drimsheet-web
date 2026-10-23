import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { IAccountingIntervalCreationReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateAccountingInterval() {
  return useMutation({
    mutationFn: (payload: IAccountingIntervalCreationReq) =>
      accountingService.createAccountingInterval(payload),
    retry: false,
  });
}
