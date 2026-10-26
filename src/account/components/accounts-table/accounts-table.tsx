import { Button } from '@/shared/components/button';
import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { SearchField } from '@/shared/components/search-field';
import { StatusBadge } from '@/shared/components/status-badge';
import { Tabs } from '@/shared/components/tabs';
import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountsTableError } from './parts/accounts-table-error';
import type { AccountsTableProps, IAccountsTableRow } from './types';

export function AccountsTable({
  accounts,
  loading,
  error,
  search,
  type,
  onSearchChange,
  onTypeChange,
  onPageChange,
  onAddAccount,
  onViewAccount,
  renderRowActions,
}: Readonly<AccountsTableProps>) {
  const { t } = useTranslation('ledger-accounts');

  const columns = useMemo<ITableColumn<IAccountsTableRow>[]>(
    () => [
      {
        dataIndex: 'name',
        title: t('dashboard_name_label'),
        minWidth: 200,
        proportion: 3,
        render: (_, row) => (
          <Button
            variant="link"
            className="h-auto min-h-9 max-w-full justify-start whitespace-normal break-words px-0 text-left focus-visible:underline"
            onClick={() => onViewAccount(row.id)}
          >
            {row.name}
          </Button>
        ),
      },
      {
        dataIndex: 'behavior',
        title: t('dashboard_type_label'),
        minWidth: 120,
        render: (_, row) => t(`dashboard_type_${row.behavior}`),
      },
      {
        dataIndex: 'balance',
        title: t('dashboard_table_balance_label'),
        align: 'right',
        minWidth: 160,
        proportion: 2,
        render: (_, row) => (
          <Money value={row.balance} className="tabular-nums" />
        ),
      },
      {
        dataIndex: 'status',
        title: t('dashboard_status_label'),
        minWidth: 112,
        render: (_, row) => (
          <StatusBadge
            variant={row.status === 'active' ? 'success' : 'neutral'}
            label={t(`dashboard_status_${row.status}`)}
          />
        ),
      },
      {
        dataIndex: 'id',
        title: '',
        width: 64,
        render: (_, row) => renderRowActions?.(row),
      },
    ],
    [t, onViewAccount, renderRowActions]
  );

  const labels = {
    tableLabel: t('dashboard_table_title'),
    searchLabel: t('dashboard_search_label'),
    filterLabel: t('dashboard_type_filter_label'),
    loadingLabel: t('dashboard_loading_table'),
    errorTitle: t('dashboard_table_error_title'),
    errorDescription: t('dashboard_error_description'),
    emptyTitle: t('dashboard_no_results_title'),
    emptyDescription: t('dashboard_no_results_description'),
    clearLabel: t('dashboard_clear_search_label'),
    addLabel: t('add_account'),
    tabLabels: {
      all: t('dashboard_all_tab'),
      bank: t('dashboard_bank_tab'),
      petty_cash: t('dashboard_petty_cash_tab'),
    },
    emptyByType: {
      all: {
        title: t('dashboard_empty_title'),
        description: t('dashboard_empty_description'),
      },
      bank: {
        title: t('dashboard_no_bank_title'),
        description: t('dashboard_no_bank_description'),
      },
      petty_cash: {
        title: t('dashboard_no_petty_cash_title'),
        description: t('dashboard_no_petty_cash_description'),
      },
    },
  };

  const tabs = [
    { value: 'all', label: labels.tabLabels.all },
    { value: 'bank', label: labels.tabLabels.bank },
    { value: 'petty_cash', label: labels.tabLabels.petty_cash },
  ];

  const type_empty_state = labels.emptyByType[type];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          ariaLabel={labels.filterLabel}
          value={type}
          onValueChange={onTypeChange}
          items={tabs.map((tab) => ({ ...tab, disabled: error }))}
        />
        <div className="w-full sm:w-56">
          <SearchField
            type="search"
            aria-label={labels.searchLabel}
            placeholder={labels.searchLabel}
            value={search}
            disabled={error}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      {loading && <output className="sr-only">{labels.loadingLabel}</output>}
      {error && (
        <AccountsTableError
          title={labels.errorTitle}
          description={labels.errorDescription}
        />
      )}
      {!error && (
        <DataTable
          columns={columns}
          data={accounts?.data ?? []}
          loading={loading}
          aria-label={labels.tableLabel}
          pagination={
            accounts && !loading
              ? { meta: accounts.meta, onPageChange }
              : undefined
          }
          emptyStateNode={
            <Empty className="px-0 py-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search aria-hidden />
                </EmptyMedia>
                <EmptyTitle>
                  {search ? labels.emptyTitle : type_empty_state.title}
                </EmptyTitle>
                <EmptyDescription>
                  {search
                    ? labels.emptyDescription
                    : type_empty_state.description}
                </EmptyDescription>
              </EmptyHeader>
              {search && (
                <Button variant="outline" onClick={() => onSearchChange('')}>
                  {labels.clearLabel}
                </Button>
              )}
              {!search && (
                <Button onClick={onAddAccount}>{labels.addLabel}</Button>
              )}
            </Empty>
          }
        />
      )}
    </>
  );
}
