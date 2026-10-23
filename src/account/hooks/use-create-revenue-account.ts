import { categoryService } from '@/account/lib/services/category.service';
import type { ICreateRevenueAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateRevenueAccount() {
  return useMutation({
    mutationFn: (payload: ICreateRevenueAccountDto) =>
      categoryService.createRevenue(payload),
    retry: false,
  });
}
