import { useAccountBalanceContributionsByCounterparty } from '@/reporting/hooks/use-account-balance-contributions-by-counterparty';
import { useState } from 'react';
import type { CounterpartyShareContainerProps } from '../types';
import { CounterpartyShare } from './counterparty-share';

export function CounterpartyShareContainer({
  accountId,
  from,
  to,
  type,
  selectedId,
  onSelect,
}: Readonly<CounterpartyShareContainerProps>) {
  const [page, setPage] = useState(1);
  const query = { page, limit: 5, from, to };

  const participation = useAccountBalanceContributionsByCounterparty(
    accountId,
    query
  );

  return (
    <CounterpartyShare
      type={type}
      counterparties={participation.data?.data ?? []}
      pagination={participation.data?.meta}
      loading={participation.isPending}
      error={participation.isError}
      onPageChange={setPage}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}
