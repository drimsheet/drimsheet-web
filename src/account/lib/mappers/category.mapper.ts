import type { ICategoryFormValues } from '@/account/components/category-form';
import type {
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  IUpdateRevenueAccountDto,
  TSupportedExpenseAccountBehavior,
  TSupportedRevenueAccountBehavior,
} from '@/shared/lib/api/Api';

export const categoryMapper = Object.freeze({
  toRevenue(values: ICategoryFormValues): ICreateRevenueAccountDto {
    return {
      name: values.name.trim(),
      isControlAccount: false,
      behavior: values.behavior as TSupportedRevenueAccountBehavior,
    };
  },
  toExpense(values: ICategoryFormValues): ICreateExpenseAccountDto {
    return {
      name: values.name.trim(),
      isControlAccount: false,
      behavior: values.behavior as TSupportedExpenseAccountBehavior,
    };
  },
  toUpdate(values: ICategoryFormValues): IUpdateRevenueAccountDto {
    return { name: values.name.trim() };
  },
});
