import { categoryService } from '@/account/lib/services/category.service';
import type {
  IDateRangeDto,
  IGetRevenueExpenseAccountsQuery,
} from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategoryAccounts(query: IGetRevenueExpenseAccountsQuery) {
  return useQuery({
    queryKey: ['categoryService', 'accounts', query],
    queryFn: () => categoryService.getAccounts(query),
  });
}

export function useCategorySummary(query: IDateRangeDto) {
  return useQuery({
    queryKey: ['categoryService', 'summary', query],
    queryFn: () => categoryService.getSummary(query),
  });
}
