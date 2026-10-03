import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { ICreateSuspenseAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateSuspenseAccount() {
  return useMutation({
    retry: false,
    mutationFn: (data: ICreateSuspenseAccountDto) =>
      accountingBootstrapService.createSuspense(data),
  });
}
