import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import {
  ELedgerType,
  type ICounterpartyDto,
  type IGetLedgerAccountsQuery,
  type ILedgerAccountDto,
} from '@/shared/lib/api/Api';
import { useQueries, useQuery } from '@tanstack/react-query';
import allTransactionsHelpers from '../helper';

async function loadAccounts(
  query: IGetLedgerAccountsQuery,
  signal: AbortSignal
) {
  const accounts: ILedgerAccountDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await ledgerAccountService.getLedgerAccounts(
      { ...query, page, limit: 100 },
      signal
    );

    accounts.push(...response.data);
    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return accounts;
}

async function loadCounterparties() {
  const counterparties: ICounterpartyDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await counterpartyService.getCounterparties({
      page,
      limit: 100,
    });

    counterparties.push(...response.data);
    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return counterparties;
}

export function useTransactionFilterOptions() {
  const queries: IGetLedgerAccountsQuery[] = [
    ledgerAccountService.getPettyBaseCashFilters(),
    { type: ELedgerType.Revenue, isControlAccount: false },
    { type: ELedgerType.Expense, isControlAccount: false },
  ];

  const accounts = useQueries({
    queries: queries.map((query) => ({
      queryKey: [
        'ledgerAccountService',
        'getLedgerAccounts',
        query,
        'all-pages',
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        loadAccounts(query, signal),
      throwOnError: false,
    })),
  });

  const counterparties = useQuery({
    queryKey: ['counterpartyService', 'getCounterparties', 'all-pages'],
    queryFn: loadCounterparties,
    throwOnError: false,
  });

  return {
    options: allTransactionsHelpers.filterOptions(
      accounts[0].data ?? [],
      [...(accounts[1].data ?? []), ...(accounts[2].data ?? [])],
      counterparties.data ?? []
    ),
    loading:
      accounts.some((query) => query.isPending) || counterparties.isPending,
    error: accounts.some((query) => query.isError) || counterparties.isError,
  };
}
