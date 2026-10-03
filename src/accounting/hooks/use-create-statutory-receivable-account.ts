import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { ICreateStatutoryReceivableAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateStatutoryReceivableAccount() {
  return useMutation({
    retry: false,
    mutationFn: (data: ICreateStatutoryReceivableAccountDto) =>
      accountingBootstrapService.createReceivable(data),
  });
}
