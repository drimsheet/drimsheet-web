import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { IReportingContextCreationReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateReportingContext() {
  return useMutation({
    mutationFn: (payload: IReportingContextCreationReq) =>
      accountingService.createReportingContext(payload),
    retry: false,
  });
}
