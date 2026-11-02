import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import categoryDetailsHelpers from '../helper';
import type { CategoryTransactionsContainerProps } from '../types';
import {
  CategoryTransactions,
  CategoryTransactionsWithState,
} from './category-transactions';

export function CategoryTransactionsContainer({
  accountId,
  from,
  to,
  counterpartyId,
  selectedCounterparty,
  onClearCounterparty,
}: Readonly<CategoryTransactionsContainerProps>) {
  const query = categoryDetailsHelpers.recentQuery(
    accountId,
    from,
    to,
    counterpartyId
  );

  const transactions = useJournalEntries(query, { throwOnError: false });
  const data = transactions.data;

  const params = new URLSearchParams({
    accountId,
    effectiveDateFrom: from,
    effectiveDateTo: to,
  });

  if (query.counterpartyId) {
    params.set('counterpartyId', query.counterpartyId);
  }

  return (
    <CategoryTransactionsWithState
      loading={transactions.isPending}
      error={transactions.isError}
    >
      {data && (
        <CategoryTransactions
          entries={data.data}
          total={data.meta.total}
          selectedCounterparty={selectedCounterparty}
          onClearCounterparty={onClearCounterparty}
          transactionsHref={`/transactions/list?${params}`}
        />
      )}
    </CategoryTransactionsWithState>
  );
}
