import { accountingService } from '@/accounting/lib/services/accounting.service';
import type { IReportingIntervalCreationReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useCreateReportingInterval() {
  return useMutation({
    mutationFn: (payload: IReportingIntervalCreationReq) =>
      accountingService.createReportingInterval(payload),
    retry: false,
  });
}
