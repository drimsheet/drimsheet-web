import { categoryService } from '@/account/lib/services/category.service';
import type { ICreateExpenseAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateExpenseAccount() {
  return useMutation({
    mutationFn: (payload: ICreateExpenseAccountDto) =>
      categoryService.createExpense(payload),
    retry: false,
  });
}
