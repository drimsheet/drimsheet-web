import { categoryService } from '@/account/lib/services/category.service';
import type { IGetRevenueExpenseAccountsQuery } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategoryAccounts(query: IGetRevenueExpenseAccountsQuery) {
  return useQuery({
    queryKey: ['categoryService', 'getAccounts', query],
    queryFn: () => categoryService.getAccounts(query),
  });
}
