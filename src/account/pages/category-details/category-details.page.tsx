import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { useAccountActivity } from '@/reporting/hooks/use-account-activity';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { StatusBadge } from '@/shared/components/status-badge';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import categoryDetailsHelpers from './helper';
import { CategoryActionsContainer } from './parts/category-actions.container';
import { CategoryChartsWithState } from './parts/category-charts';
import { CategoryMetadata } from './parts/category-metadata';
import {
  CategorySummary,
  CategorySummaryWithState,
} from './parts/category-summary';
import { CategoryTransactionsWithState } from './parts/category-transactions';
import { CategoryTransactionsContainer } from './parts/category-transactions.container';
import { CategoryTrend, CategoryTrendWithState } from './parts/category-trend';
import { CounterpartyShareContainer } from './parts/counterparty-share.container';
import type { CounterpartyShareProps } from './types';

export function CategoryDetailsPage() {
  const { accountId = '' } = useParams();
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const [period, setPeriod] = useState('6');
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

  const range = categoryDetailsHelpers.period(now, period);
  const query = { from: range.from, to: range.to, bucketDays: 1 };

  const activityQuery = useAccountActivity(accountId, query, isCategory);

  const recent = useJournalEntries(
    categoryDetailsHelpers.recentQuery(accountId, range.from, range.to),
    { enabled: isCategory, throwOnError: false }
  );

  const activity = useMemo(() => {
    if (!account || !activityQuery.data) {
      return null;
    }

    try {
      return categoryDetailsHelpers.fromActivity(activityQuery.data);
    } catch {
      return null;
    }
  }, [account, activityQuery.data]);

  const selectedId =
    selected?.accountId === accountId ? selected.counterpartyId : null;

  const transactionCount = recent.isPending
    ? undefined
    : (recent.data?.meta.total ?? null);

  const handleSelect = (
    participation: CounterpartyShareProps['counterparties'][number]
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

  if (accountQuery.isSuccess && account && !isCategory) {
    return <Navigate replace to={`/accounts/${account.id}`} />;
  }

  const unassigned_label = t(
    'ledger-accounts:category_details_unassigned_label'
  );

  const self_label = t('ledger-accounts:category_details_self_label');

  const selectedName =
    selectedId === 'self' ? self_label : (selected?.name ?? unassigned_label);

  const show_detail_sections =
    !accountQuery.isError && (accountQuery.isPending || isCategory);

  const breadcrumb_label = t('categories_table_breadcrumb');
  const overview_title = t('details_overview_title');
  const status_label = account ? t(`categories_status_${account.status}`) : '';

  const recent_transactions_title = t(
    'category_details_recent_transactions_title'
  );

  return (
    <AppBody
      title={account?.name}
      titleBadgeSlot={
        account && isCategory ? (
          <StatusBadge
            variant={account.status === 'active' ? 'success' : 'neutral'}
            label={status_label}
          />
        ) : undefined
      }
      metadataSlot={
        account && isCategory ? (
          <CategoryMetadata account={account} />
        ) : undefined
      }
      actionsSlot={
        account && isCategory ? (
          <CategoryActionsContainer key={account.id} account={account} />
        ) : undefined
      }
      breadcrumbs={{
        label: breadcrumb_label,
        link: '/categories',
        next: { label: account?.name ?? '…' },
      }}
    >
      <AppSection title={accountQuery.isError ? undefined : overview_title}>
        <CategorySummaryWithState
          loading={accountQuery.isPending}
          error={accountQuery.isError}
          showPeriod
        >
          {account && isCategory && (
            <CategorySummary
              account={account}
              balance={
                activityQuery.isPending
                  ? undefined
                  : (activity?.balance ?? null)
              }
              period={period}
              onPeriodChange={setPeriod}
              transactionCount={transactionCount}
            />
          )}
        </CategorySummaryWithState>
      </AppSection>
      {show_detail_sections && (
        <>
          <AppSection>
            <CategoryChartsWithState loading={accountQuery.isPending}>
              {account && isCategory && (
                <>
                  <CategoryTrendWithState
                    loading={activityQuery.isPending}
                    error={
                      activityQuery.isError ||
                      (activityQuery.isSuccess && activity === null)
                    }
                  >
                    {activityQuery.isSuccess && activity && (
                      <CategoryTrend
                        months={activity.months}
                        hasTransactions={activity.hasActivity}
                        currencyCode={account.functionalBalance.currencyCode}
                        type={
                          account.type === 'revenue' ? 'revenue' : 'expense'
                        }
                      />
                    )}
                  </CategoryTrendWithState>
                  <CounterpartyShareContainer
                    key={`${accountId}:${range.from}:${range.to}`}
                    accountId={accountId}
                    from={range.from}
                    to={range.to}
                    type={account.type === 'revenue' ? 'revenue' : 'expense'}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                  />
                </>
              )}
            </CategoryChartsWithState>
          </AppSection>
          <AppSection title={recent_transactions_title}>
            <CategoryTransactionsWithState loading={accountQuery.isPending}>
              {account && isCategory && (
                <CategoryTransactionsContainer
                  accountId={accountId}
                  from={range.from}
                  to={range.to}
                  counterpartyId={selectedId}
                  selectedCounterparty={
                    selectedId === null ? null : selectedName
                  }
                  onClearCounterparty={() => setSelected(null)}
                />
              )}
            </CategoryTransactionsWithState>
          </AppSection>
        </>
      )}
    </AppBody>
  );
}
