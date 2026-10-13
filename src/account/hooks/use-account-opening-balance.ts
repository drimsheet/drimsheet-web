import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import type { IOpeningBalanceDto } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function useAccountOpeningBalance(accountId: string) {
  const [openingBalance, setOpeningBalance] =
    useState<IOpeningBalanceDto | null>();

  const read = useQuery({
    queryKey: [
      'ledgerAccountService',
      'getOpeningBalance',
      accountId,
      'update',
    ],
    queryFn: () => ledgerAccountService.getOpeningBalance(accountId),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    enabled: openingBalance === undefined,
  });

  // Keep the fetched baseline stable until this edit session is closed.
  if (
    openingBalance === undefined &&
    read.isFetchedAfterMount &&
    read.isSuccess &&
    !read.isFetching
  )
    setOpeningBalance(read.data);

  return { openingBalance, isError: read.isError, refetch: read.refetch };
}
