import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { BankAccountCreationDialog } from '@/account/dialogs/bank-account-creation';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import { AppBody } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { Separator } from '@/shared/components/separator';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import {
  ELedgerAccountBehavior,
  type ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dashboardHelpers from './helper';
import { useAccountBreakdown } from './hooks/use-account-breakdown';
import { useDashboardAccounts } from './hooks/use-dashboard-accounts';
import { useDashboardSummary } from './hooks/use-dashboard-summary';
import { AccountBreakdown } from './parts/account-breakdown';
import { AccountPageEmptyState } from './parts/account-page-empty-state';
import {
  AccountsSummary,
  AccountsSummarySkeleton,
} from './parts/account-summary';
import { AccountsTable } from './parts/accounts-table';
import { BalanceHistoryContainer } from './parts/balance-history.container';
import { DashboardError } from './parts/section-error';
import type { UAccountTypeFilter, UBalancePeriod } from './types';

export function AccountsDashboardPage() {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const navigate = useNavigate();
  const [now] = useState(() => new Date());
  const [period, setPeriod] = useState<UBalancePeriod>('6M');

  const [showAccountTypeSelection, setShowAccountTypeSelection] =
    useState(false);

  const [selectedBehavior, setSelectedBehavior] =
    useState<ULedgerAccountBehavior | null>(null);

  const table = useTableQueryParams<string, 'type'>({ filterKeys: ['type'] });
  const search = useDebounce(table.searchQuery, 300);
  const filter = table.filters.type?.[0];

  const type: UAccountTypeFilter =
    filter === 'asset' || filter === 'liability' ? filter : 'all';

  const accounts = useDashboardAccounts({
    page: Math.max(1, table.page),
    limit: 10,
    search: search || undefined,
    type: type === 'all' ? undefined : type,
  });

  const summary = useDashboardSummary(
    dashboardHelpers.periodQuery(period, now)
  );

  const assets = useAccountBreakdown('asset');
  const liabilities = useAccountBreakdown('liability');

  const noAccounts =
    assets.isSuccess &&
    liabilities.isSuccess &&
    assets.data.pages[0].meta.total === 0 &&
    liabilities.data.pages[0].meta.total === 0;

  const pageError =
    accounts.isError &&
    summary.isError &&
    assets.isError &&
    liabilities.isError &&
    !accounts.data &&
    !summary.data &&
    !assets.data &&
    !liabilities.data;

  const handleAccountTypeSelected = (behavior: ULedgerAccountBehavior) => {
    setShowAccountTypeSelection(false);
    setSelectedBehavior(behavior);
  };

  const handleTypeChange = (value: string) => {
    table.handleFilterChange({ type: value === 'all' ? [] : [value] });
  };

  const handleViewAccount = (id: string) =>
    navigate(`/accounts/${encodeURIComponent(id)}`);

  const handleAddAccount = () => setShowAccountTypeSelection(true);

  const title = t('shared:accounts');
  const add_label = t('ledger-accounts:add_account');
  const overview_title = t('ledger-accounts:dashboard_overview_title');
  const page_error_title = t('ledger-accounts:dashboard_page_error_title');

  const summary_error_title = t(
    'ledger-accounts:dashboard_summary_error_title'
  );

  return (
    <AppBody>
      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <PageTitle>{title}</PageTitle>
          {!noAccounts && (
            <Button size="lg" onClick={handleAddAccount}>
              <Plus data-icon="inline-start" />
              {add_label}
            </Button>
          )}
        </header>
        {pageError && (
          <PageSection>
            <DashboardError title={page_error_title} />
          </PageSection>
        )}
        {!pageError && noAccounts && (
          <PageSection>
            <AccountPageEmptyState onAddAccount={handleAddAccount} />
          </PageSection>
        )}
        {!pageError && !noAccounts && (
          <>
            <PageSection title={overview_title}>
              {summary.isPending && <AccountsSummarySkeleton />}
              {summary.isError && (
                <DashboardError title={summary_error_title} />
              )}
              {summary.isSuccess && <AccountsSummary summary={summary.data} />}
              <Separator />
              <BalanceHistoryContainer
                period={period}
                onPeriodChange={setPeriod}
                summary={summary.data}
                summaryError={summary.isError}
                enabled={!noAccounts}
              />
              <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-2">
                {(
                  [
                    { type: 'asset', query: assets },
                    { type: 'liability', query: liabilities },
                  ] as const
                ).map(({ type: accountType, query }) => (
                  <AccountBreakdown
                    key={accountType}
                    type={accountType}
                    accounts={
                      query.data?.pages.flatMap((page) => page.data) ?? []
                    }
                    loading={query.isPending}
                    error={query.isError}
                    hasMore={query.hasNextPage}
                    loadingMore={query.isFetching}
                    onLoadMore={() => void query.fetchNextPage()}
                    onViewAccount={handleViewAccount}
                  />
                ))}
              </div>
            </PageSection>
            <AccountsTable
              accounts={accounts.data}
              loading={accounts.isPending || search !== table.searchQuery}
              error={accounts.isError}
              search={table.searchQuery}
              type={type}
              onSearchChange={table.handleSearchChange}
              onTypeChange={handleTypeChange}
              onPageChange={table.handlePageChange}
              onAddAccount={handleAddAccount}
              onViewAccount={handleViewAccount}
            />
          </>
        )}
        <AccountTypeSelectionDialog
          open={showAccountTypeSelection}
          onClose={() => setShowAccountTypeSelection(false)}
          onSubmit={handleAccountTypeSelected}
        />
        <PettyCashAccountCreationDialog
          open={selectedBehavior === ELedgerAccountBehavior.PettyCash}
          onClose={() => setSelectedBehavior(null)}
        />
        <BankAccountCreationDialog
          open={selectedBehavior === ELedgerAccountBehavior.Bank}
          onClose={() => setSelectedBehavior(null)}
        />
      </div>
    </AppBody>
  );
}
