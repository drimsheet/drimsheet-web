import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { ICreateExpenseAccountDto } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateExpenseAccount() {
  return useMutation({
    retry: false,
    mutationFn: (data: ICreateExpenseAccountDto) =>
      accountingBootstrapService.createExpense(data),
  });
}
