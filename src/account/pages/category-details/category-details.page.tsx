import { useLedgerAccount } from '@/account/hooks/use-ledger-account';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import {
  ReportingIntervalSelect,
  ReportingIntervalSelectSkeleton,
} from '@/reporting/components/reporting-interval-select';
import { useAccountActivity } from '@/reporting/hooks/use-account-activity';
import { useReportingInterval } from '@/reporting/hooks/use-reporting-interval';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import type { UIntervalSelection } from '@/shared/components/interval-select';
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

  const reporting = useReportingInterval(isCategory);
  const range = reporting.range;
  const query = { from: range?.from ?? '', to: range?.to ?? '', bucketDays: 1 };

  const activityQuery = useAccountActivity(
    accountId,
    query,
    isCategory && !!range
  );

  const recent = useJournalEntries(
    categoryDetailsHelpers.recentQuery(
      accountId,
      range?.from ?? '',
      range?.to ?? ''
    ),
    { enabled: isCategory && !!range, throwOnError: false }
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

  const transactionCount =
    !reporting.isRangeTooLong && (reporting.isPending || recent.isPending)
      ? undefined
      : (recent.data?.meta.total ?? null);

  const handleIntervalChange = (selection: UIntervalSelection) => {
    reporting.onChange(selection);
    setSelected(null);
  };

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
    !accountQuery.isError &&
    !reporting.isError &&
    !reporting.isRangeTooLong &&
    (accountQuery.isPending ||
      (isCategory && (reporting.isPending || !!range)));

  const breadcrumb_label = t('categories_table_breadcrumb');
  const overview_title = t('details_overview_title');
  const range_error_text = t('reporting_range_too_long_error');
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
          error={accountQuery.isError || reporting.isError}
          showPeriod
        >
          {account && isCategory && (
            <CategorySummary
              account={account}
              balance={
                !reporting.isRangeTooLong &&
                (reporting.isPending || activityQuery.isPending)
                  ? undefined
                  : (activity?.balance ?? null)
              }
              intervalSlot={
                <>
                  {reporting.isPending && <ReportingIntervalSelectSkeleton />}
                  {reporting.interval && !reporting.isPending && (
                    <ReportingIntervalSelect
                      interval={reporting.interval}
                      onChange={handleIntervalChange}
                    />
                  )}
                </>
              }
              rangeError={
                reporting.isRangeTooLong ? range_error_text : undefined
              }
              transactionCount={transactionCount}
            />
          )}
        </CategorySummaryWithState>
      </AppSection>
      {show_detail_sections && (
        <>
          <AppSection>
            <CategoryChartsWithState
              loading={accountQuery.isPending || reporting.isPending}
            >
              {account && isCategory && range && (
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
            <CategoryTransactionsWithState
              loading={accountQuery.isPending || reporting.isPending}
            >
              {account && isCategory && range && (
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
