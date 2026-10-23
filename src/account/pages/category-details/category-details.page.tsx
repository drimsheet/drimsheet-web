import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { AppBody } from '@/shared/components/app';
import { Skeleton } from '@/shared/components/skeleton';
import type { IAccountCounterpartyParticipationDto } from '@/shared/lib/api/Api';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import categoryDetailsHelpers from './helper';
import { useCategoryHistory } from './hooks/use-category-history';
import { CategoryActionsContainer } from './parts/category-actions.container';
import { CategorySummary } from './parts/category-summary';
import { CategoryTransactions } from './parts/category-transactions';
import { CategoryTrend } from './parts/category-trend';
import { CounterpartyShareContainer } from './parts/counterparty-share.container';
import { CategoryDetailsError } from './parts/section-error';
import { CategoryActivitySkeleton } from './parts/skeleton';

export function CategoryDetailsPage() {
  const { accountId = '' } = useParams();
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const [now] = useState(() => new Date());

  const [selected, setSelected] = useState<{
    accountId: string;
    counterpartyId: string;
    name: string | null;
  } | null>(null);

  const accountQuery = useLedgerAccount(accountId);
  const account = accountQuery.data;

  const isCategory =
    !!account &&
    !account.isControlAccount &&
    (account.type === 'revenue' || account.type === 'expense');

  const history = useCategoryHistory(accountId, isCategory);

  const activity = useMemo(() => {
    if (!account || !history.data) return null;

    try {
      return categoryDetailsHelpers.activity(history.data, account, now);
    } catch {
      return null;
    }
  }, [account, history.data, now]);

  const selectedId =
    selected?.accountId === accountId ? selected.counterpartyId : null;

  const transactions = useMemo(
    () =>
      categoryDetailsHelpers.filterTransactions(
        activity?.transactions ?? [],
        '',
        selectedId,
        'desc'
      ),
    [activity, selectedId]
  );

  const transactionCount = history.isPending
    ? undefined
    : (activity?.transactions.length ?? null);

  const handleSelect = (
    participation: IAccountCounterpartyParticipationDto
  ) => {
    const counterpartyId =
      categoryDetailsHelpers.participationId(participation);

    setSelected(
      selectedId === counterpartyId
        ? null
        : {
            accountId,
            counterpartyId,
            name: participation.counterparty?.name ?? null,
          }
    );
  };

  if (accountQuery.isSuccess && account && !isCategory)
    return <Navigate replace to={`/accounts/${account.id}`} />;

  const unassigned_label = t(
    'ledger-accounts:category_details_unassigned_label'
  );

  const self_label = t('ledger-accounts:category_details_self_label');

  const selectedName =
    selectedId === 'self' ? self_label : (selected?.name ?? unassigned_label);

  const loading_label = t('ledger-accounts:details_loading_account_summary');

  return (
    <>
      <AppBody>
        <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col">
          {accountQuery.isPending && (
            <>
              <Skeleton className="h-48 w-full" aria-label={loading_label} />
              <CategoryActivitySkeleton />
            </>
          )}
          {accountQuery.isError && (
            <CategoryDetailsError onRetry={() => void accountQuery.refetch()} />
          )}
          {account && isCategory && (
            <>
              <CategorySummary
                account={account}
                transactionCount={transactionCount}
                actions={
                  <CategoryActionsContainer
                    key={account.id}
                    account={account}
                  />
                }
              />
              <div className="grid min-w-0 items-start gap-x-5 lg:grid-cols-2">
                {history.isPending && (
                  <Skeleton
                    className="h-80 w-full"
                    aria-label={loading_label}
                  />
                )}
                {(history.isError ||
                  (history.isSuccess && activity === null)) && (
                  <CategoryDetailsError
                    onRetry={() => void history.refetch()}
                  />
                )}
                {history.isSuccess && activity && (
                  <CategoryTrend
                    months={activity.months}
                    currencyCode={account.functionalBalance.currencyCode}
                    type={account.type === 'revenue' ? 'revenue' : 'expense'}
                  />
                )}
                <CounterpartyShareContainer
                  type={account.type === 'revenue' ? 'revenue' : 'expense'}
                  key={accountId}
                  accountId={accountId}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              </div>
              {history.isPending && (
                <Skeleton className="h-64 w-full" aria-label={loading_label} />
              )}
              {history.isSuccess && activity && (
                <CategoryTransactions
                  key={`${accountId}:${selectedId ?? 'all'}`}
                  transactions={transactions}
                  selectedCounterparty={
                    selectedId === null ? null : selectedName
                  }
                  onClearCounterparty={() => setSelected(null)}
                  transactionsHref={`/transactions?accountId=${encodeURIComponent(accountId)}`}
                />
              )}
            </>
          )}
        </div>
      </AppBody>
    </>
  );
}
