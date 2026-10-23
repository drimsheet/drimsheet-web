import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { CounterpartyShareContainerProps } from '../types';
import { CounterpartyShare } from './counterparty-share';

export function CounterpartyShareContainer({
  accountId,
  type,
  selectedId,
  onSelect,
}: Readonly<CounterpartyShareContainerProps>) {
  const [page, setPage] = useState(1);
  const query = { page, limit: 5 };

  const participation = useQuery({
    queryKey: [
      'ledgerAccountService',
      'getAccountCounterpartyParticipation',
      accountId,
      query,
    ],
    queryFn: ({ signal }) =>
      ledgerAccountService.getAccountCounterpartyParticipation(
        accountId,
        query,
        signal
      ),
  });

  return (
    <CounterpartyShare
      type={type}
      counterparties={participation.data?.data ?? []}
      pagination={participation.data?.meta}
      loading={participation.isPending}
      error={participation.isError}
      onPageChange={setPage}
      onRetry={() => void participation.refetch()}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}
