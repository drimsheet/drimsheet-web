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
import { PageSection } from '@/shared/components/page-section';
import { SearchField } from '@/shared/components/search-field';
import { StatusBadge } from '@/shared/components/status-badge';
import { Tabs } from '@/shared/components/tabs';
import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type { AccountsTableProps, IAccountTableRow } from '../types';
import { DashboardError } from './section-error';

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
}: Readonly<AccountsTableProps>) {
  const { t } = useTranslation('ledger-accounts');

  const rows = useMemo(
    () => dashboardHelpers.tableRows(accounts?.data ?? []),
    [accounts?.data]
  );

  const columns = useMemo<ITableColumn<IAccountTableRow>[]>(
    () => [
      {
        dataIndex: 'accountName',
        title: t('dashboard_name_label'),
        minWidth: 200,
        proportion: 3,
        render: (_, row) => (
          <Button
            variant="link"
            className="h-auto min-h-9 max-w-full justify-start whitespace-normal break-words px-0 text-left focus-visible:underline"
            onClick={() => onViewAccount(row.accountId)}
          >
            {row.accountName}
          </Button>
        ),
      },
      {
        dataIndex: 'type',
        title: t('dashboard_type_label'),
        minWidth: 100,
        render: (_, row) => t(`dashboard_type_${row.type}`),
      },
      {
        dataIndex: 'amount',
        title: t('dashboard_table_balance_label'),
        align: 'right',
        minWidth: 160,
        proportion: 2,
        render: (_, row) => (
          <Money value={row.amount} className="tabular-nums" />
        ),
      },
      {
        dataIndex: 'status',
        title: t('dashboard_status_label'),
        minWidth: 112,
        render: (_, row) => (
          <StatusBadge
            variant="neutral"
            label={t(`dashboard_status_${row.status}`)}
          />
        ),
      },
    ],
    [t, onViewAccount]
  );

  const title = t('dashboard_table_title');
  const search_label = t('dashboard_search_label');
  const filter_label = t('dashboard_type_filter_label');
  const loading_label = t('dashboard_loading_table');
  const error_title = t('dashboard_table_error_title');
  const empty_title = t('dashboard_no_results_title');
  const empty_description = t('dashboard_no_results_description');
  const clear_label = t('dashboard_clear_search_label');

  const no_type_title = t(
    type === 'liability'
      ? 'dashboard_no_liability_title'
      : 'dashboard_no_asset_title'
  );

  const no_type_description = t(
    type === 'liability'
      ? 'dashboard_no_liability_description'
      : 'dashboard_no_asset_description'
  );

  const add_label = t('add_account');

  const tabs = [
    { value: 'all', label: t('dashboard_all_tab') },
    { value: 'asset', label: t('dashboard_asset_tab') },
    { value: 'liability', label: t('dashboard_liabilities_tab') },
  ];

  return (
    <PageSection title={title}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          ariaLabel={filter_label}
          value={type}
          onValueChange={onTypeChange}
          items={tabs.map((tab) => ({ ...tab, disabled: error }))}
        />
        <div className="w-full sm:w-56">
          <SearchField
            type="search"
            aria-label={search_label}
            placeholder={search_label}
            value={search}
            disabled={error}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      {loading && (
        <span role="status" className="sr-only">
          {loading_label}
        </span>
      )}
      {error && <DashboardError title={error_title} />}
      {!error && (
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          aria-label={title}
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
                <EmptyTitle>{search ? empty_title : no_type_title}</EmptyTitle>
                <EmptyDescription>
                  {search ? empty_description : no_type_description}
                </EmptyDescription>
              </EmptyHeader>
              {search && (
                <Button variant="outline" onClick={() => onSearchChange('')}>
                  {clear_label}
                </Button>
              )}
              {!search && type !== 'liability' && (
                <Button onClick={onAddAccount}>{add_label}</Button>
              )}
            </Empty>
          }
        />
      )}
    </PageSection>
  );
}
