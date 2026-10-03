import { accountingBootstrapService } from '@/accounting/lib/services/accounting-bootstrap.service';
import type { IHeaderAccountNameAliasesReq } from '@/shared/lib/api/Api';
import { useMutation } from '@tanstack/react-query';

export function useSetupHeaderAccounts() {
  return useMutation({
    retry: false,
    mutationFn: (data?: IHeaderAccountNameAliasesReq) =>
      accountingBootstrapService.setupHeaders(data),
  });
}
