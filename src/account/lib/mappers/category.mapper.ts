import type { ICategoryFormValues } from '@/account/components/category-form';
import type { IUpdateRevenueAccountDto } from '@/shared/lib/api/Api';

export const categoryMapper = Object.freeze({
  toUpdate(values: ICategoryFormValues): IUpdateRevenueAccountDto {
    return { name: values.name.trim() };
  },
});
