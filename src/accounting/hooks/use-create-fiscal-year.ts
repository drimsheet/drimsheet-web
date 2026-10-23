import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { IFiscalYearCreationReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateFiscalYear() {
  return useMutation({
    mutationFn: (payload: IFiscalYearCreationReq) =>
      accountingService.createFiscalYear(payload),
    retry: false,
  });
}
