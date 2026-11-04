import {
  AccountsTable,
  type UAccountBehaviorFilter,
} from '@/account/components/accounts-table';
import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import { useLedgerAccounts } from '@/account/hooks/use-ledger-accounts';
import accountDashboardMapper from '@/account/lib/mappers/account-dashboard.mapper';
import reportRangeUtils from '@/account/lib/utils/report-range';
import { ReportingIntervalSelectContainer } from '@/reporting/components/reporting-interval-select';
import { useAssetAndLiabilityBalancesByCurrency } from '@/reporting/hooks/use-asset-and-liability-balances-by-currency';
import { useBalancesBySubType } from '@/reporting/hooks/use-balances-by-sub-type';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';

import {
  EAssetSubType,
  ELedgerAccountBehavior,
  ELedgerType,
  type IDateRangeDto,
  type ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dashboardHelpers from './helper';
import { AccountDetailsActionsContainer } from './parts/account-details-actions.container';
import { AccountsSummaryWithState } from './parts/account-summary';
import { BalanceHistory } from './parts/balance-history';
import { EmptyAccountDashboard } from './parts/empty-account-dashboard';
import { DashboardError } from './parts/section-error';

export function AccountsDashboardPage() {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const navigate = useNavigate();

  const [range, setRange] = useState<IDateRangeDto>();

  const [showAccountTypeSelection, setShowAccountTypeSelection] =
    useState(false);

  const [selectedBehavior, setSelectedBehavior] =
    useState<ULedgerAccountBehavior | null>(null);

  const table = useTableQueryParams<string, 'type'>({ filterKeys: ['type'] });
  const search = useDebounce(table.searchQuery, 300);
  const filter = table.filters.type?.[0];

  const type: UAccountBehaviorFilter =
    filter === 'bank' || filter === 'petty_cash' ? filter : 'all';

  const accounts = useLedgerAccounts(
    {
      page: Math.max(1, table.page),
      limit: 10,
      search: search || undefined,
      types: [ELedgerType.Asset],
      subTypes: [EAssetSubType.CashAndCashEquivalent],
      behavior: type === 'all' ? undefined : type,
      isControlAccount: false,
    },
    { select: accountDashboardMapper.toAccounts }
  );

  const summary = useAssetAndLiabilityBalancesByCurrency(
    { type: ELedgerType.Asset },
    { select: accountDashboardMapper.toSummary }
  );

  const history = useBalancesBySubType(
    {
      from: range?.from ?? '',
      to: range?.to ?? '',
      bucketDays: reportRangeUtils.bucketDays(range),
      subTypes: [EAssetSubType.CashAndCashEquivalent],
    },
    { select: accountDashboardMapper.toHistory, enabled: !!range }
  );

  const balanceChange = history.data
    ? dashboardHelpers.balanceChange(history.data.points)
    : undefined;

  const hasNoAccount =
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

  const handleAccountTypeSelected = async (
    behavior: ULedgerAccountBehavior
  ) => {
    setShowAccountTypeSelection(false);
    if (behavior === ELedgerAccountBehavior.Bank) {
      await navigate('/accounts/new/bank');

      return;
    }

    setSelectedBehavior(behavior);
  };

  const handleTypeChange = (value: string) => {
    table.handleFilterChange({ type: value === 'all' ? [] : [value] });
  };

  const handleViewAccount = (id: string) =>
    navigate(`/accounts/${encodeURIComponent(id)}`);

  const handleAddAccount = () => {
    setShowAccountTypeSelection(true);
  };

  const title = t('shared:accounts');
  const add_label = t('ledger-accounts:add_account');
  const overview_title = t('ledger-accounts:dashboard_overview_title');

  const table_title = t('ledger-accounts:dashboard_table_title');
  const page_error_title = t('ledger-accounts:dashboard_page_error_title');

  const addActionNode = (
    <Button size="lg" onClick={handleAddAccount}>
      <Plus data-icon="inline-start" />
      {add_label}
    </Button>
  );

  if (hasNoAccount) {
    return (
      <>
        <AppBody title={title} actionsSlot={addActionNode}>
          <AppSection>
            <EmptyAccountDashboard onAdd={handleAddAccount} />
          </AppSection>
        </AppBody>

        <AccountTypeSelectionDialog
          open={showAccountTypeSelection}
          onClose={() => setShowAccountTypeSelection(false)}
          onSubmit={handleAccountTypeSelected}
        />
        <PettyCashAccountCreationDialog
          open={selectedBehavior === ELedgerAccountBehavior.PettyCash}
          onClose={() => setSelectedBehavior(null)}
        />
      </>
    );
  }

  if (pageError) {
    return (
      <>
        <AppBody title={title} actionsSlot={addActionNode}>
          <AppSection>
            <DashboardError title={page_error_title} />
          </AppSection>
        </AppBody>

        <AccountTypeSelectionDialog
          open={showAccountTypeSelection}
          onClose={() => setShowAccountTypeSelection(false)}
          onSubmit={handleAccountTypeSelected}
        />
        <PettyCashAccountCreationDialog
          open={selectedBehavior === ELedgerAccountBehavior.PettyCash}
          onClose={() => setSelectedBehavior(null)}
        />
      </>
    );
  }

  return (
    <>
      <AppBody title={title} actionsSlot={addActionNode}>
        <AppSection title={overview_title}>
          <AccountsSummaryWithState
            state={summary.isPending ? 'loading' : summary.status}
            summary={summary.data}
            change={balanceChange}
          />

          <BalanceHistory
            showHistory={!!range}
            intervalSlot={
              <ReportingIntervalSelectContainer onChange={setRange} />
            }
            history={history.data}
            loading={history.isPending}
            error={history.isError}
          />
        </AppSection>

        <AppSection title={table_title}>
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
              <AccountDetailsActionsContainer account={account} />
            )}
          />
        </AppSection>
      </AppBody>

      <AccountTypeSelectionDialog
        open={showAccountTypeSelection}
        onClose={() => setShowAccountTypeSelection(false)}
        onSubmit={handleAccountTypeSelected}
      />
      <PettyCashAccountCreationDialog
        open={selectedBehavior === ELedgerAccountBehavior.PettyCash}
        onClose={() => setSelectedBehavior(null)}
      />
    </>
  );
}
