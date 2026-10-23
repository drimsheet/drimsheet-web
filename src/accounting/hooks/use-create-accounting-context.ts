import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { IAccountingContextCreationReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateAccountingContext() {
  return useMutation({
    mutationFn: (payload: IAccountingContextCreationReq) =>
      accountingService.createAccountingContext(payload),
    retry: false,
  });
}
