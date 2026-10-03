import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { ICreateStatutoryPayableAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateStatutoryPayableAccount() {
  return useMutation({
    retry: false,
    mutationFn: (data: ICreateStatutoryPayableAccountDto) =>
      accountingBootstrapService.createPayable(data),
  });
}
