import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { ICreateRevenueAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateRevenueAccount() {
  return useMutation({
    retry: false,
    mutationFn: (data: ICreateRevenueAccountDto) =>
      accountingBootstrapService.createRevenue(data),
  });
}
