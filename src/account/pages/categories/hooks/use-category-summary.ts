import { categoryService } from '@/account/lib/services/category.service';
import type { IDateRangeDto } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';

export function useCategorySummary(query: IDateRangeDto) {
  return useQuery({
    queryKey: ['categoryService', 'getSummary', query],
    queryFn: () => categoryService.getSummary(query),
  });
}
