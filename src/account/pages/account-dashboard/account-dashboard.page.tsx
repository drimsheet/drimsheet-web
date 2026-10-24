import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import { useDashboardAccounts } from '@/account/hooks/use-dashboard-accounts';
import { useDashboardBalanceHistory } from '@/account/hooks/use-dashboard-balance-history';
import { useDashboardSummary } from '@/account/hooks/use-dashboard-summary';
import { AppBody } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import {
  ELedgerAccountBehavior,
  ELedgerAccountSubType,
  ELedgerType,
  type ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dashboardHelpers from './helper';
import { AccountPageEmptyState } from './parts/account-page-empty-state';
import { AccountRowActionsContainer } from './parts/account-row-actions.container';
import {
  AccountsSummary,
  AccountsSummarySkeleton,
} from './parts/account-summary';
import { AccountsTable } from './parts/accounts-table';
import { BalanceHistory } from './parts/balance-history';
import { DashboardError } from './parts/section-error';
import type { UAccountBehaviorFilter, UBalancePeriod } from './types';

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

  const type: UAccountBehaviorFilter =
    filter === 'bank' || filter === 'petty_cash' ? filter : 'all';

  const accounts = useDashboardAccounts({
    page: Math.max(1, table.page),
    limit: 10,
    search: search || undefined,
    type: ELedgerType.Asset,
    subType: ELedgerAccountSubType.CashAndCashEquivalent,
    behavior: type === 'all' ? undefined : type,
    isControlAccount: false,
  });

  const summary = useDashboardSummary();

  const history = useDashboardBalanceHistory({
    ...dashboardHelpers.periodQuery(period, now),
    bucketDays: dashboardHelpers.bucketDays(period),
    subTypes: [ELedgerAccountSubType.CashAndCashEquivalent],
  });

  const change = history.data
    ? dashboardHelpers.balanceChange(history.data.points)
    : undefined;

  const noAccounts =
    accounts.isSuccess &&
    accounts.data.meta.total === 0 &&
    type === 'all' &&
    !table.searchQuery;

  const pageError =
    accounts.isError &&
    summary.isError &&
    history.isError &&
    !accounts.data &&
    !summary.data &&
    !history.data;

  const handleAccountTypeSelected = (behavior: ULedgerAccountBehavior) => {
    setShowAccountTypeSelection(false);
    if (behavior === ELedgerAccountBehavior.Bank) {
      navigate('/accounts/new/bank');

      return;
    }

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
              {summary.isSuccess && (
                <AccountsSummary summary={summary.data} change={change} />
              )}
              <BalanceHistory
                period={period}
                onPeriodChange={setPeriod}
                history={history.data}
                loading={history.isPending}
                error={history.isError}
              />
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
              renderRowActions={(account) => (
                <AccountRowActionsContainer account={account} />
              )}
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
      </div>
    </AppBody>
  );
}
