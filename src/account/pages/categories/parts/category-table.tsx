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
import { TablePagination } from '@/shared/components/table-pagination';
import { Tabs } from '@/shared/components/tabs';
import { Inbox } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import categoriesHelpers from '../helper';
import type { CategoryTableProps, ICategoryTableRow } from '../types';
import { CategoryRowActions } from './category-row-actions';

export function CategoryTable({
  accounts,
  loading,
  search,
  type,
  onSearchChange,
  onTypeChange,
  onPageChange,
  onViewAccount,
  onEditAccount,
  onArchiveAccount,
}: Readonly<CategoryTableProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const rows = useMemo(
    () => categoriesHelpers.tableRows(accounts?.data ?? []),
    [accounts?.data]
  );

  const columns = useMemo<ITableColumn<ICategoryTableRow>[]>(() => {
    const name_label = t('categories_name_label');
    const type_label = t('categories_type_label');
    const balance_label = t('categories_balance_label');
    const share_label = t('categories_share_label');
    const transactions_label = t('categories_transactions_label');
    const status_label = t('categories_status_label');
    const actions_label = t('categories_actions_label');

    return [
      {
        dataIndex: 'accountName',
        title: name_label,
        render: (_, account) => (
          <button
            type="button"
            className="text-left underline-offset-4 hover:underline focus-visible:underline"
            onClick={() => onViewAccount(account.accountId)}
          >
            {account.accountName}
          </button>
        ),
      },
      {
        dataIndex: 'type',
        title: type_label,
        render: (_, account) => {
          if (account.type === 'revenue' || account.type === 'expense') {
            return t(`categories_type_${account.type}`);
          }

          return t('categories_uncategorized_label');
        },
      },
      {
        dataIndex: 'amount',
        title: balance_label,
        render: (_, account) => (
          <Money
            value={account.amount}
            className="text-foreground text-sm font-heading tabular-nums"
          />
        ),
      },
      {
        dataIndex: 'sharePercentage',
        title: share_label,
        render: (_, account) => (
          <span className="tabular-nums">
            {categoriesHelpers.formatPercentage(
              account.sharePercentage,
              locale
            )}
          </span>
        ),
      },
      {
        dataIndex: 'transactionCount',
        title: transactions_label,
        render: (_, account) => (
          <span className="tabular-nums">
            {account.transactionCount.toLocaleString(locale)}
          </span>
        ),
      },
      {
        dataIndex: 'status',
        title: status_label,
        render: (_, account) => (
          <StatusBadge
            variant={account.status === 'active' ? 'success' : 'neutral'}
            label={t(`categories_status_${account.status}`)}
          />
        ),
      },
      {
        dataIndex: 'id',
        headerRender: () => <span className="sr-only">{actions_label}</span>,
        render: (_, account) => (
          <CategoryRowActions
            account={account}
            onViewAccount={onViewAccount}
            onEditAccount={onEditAccount}
            onArchiveAccount={onArchiveAccount}
          />
        ),
      },
    ];
  }, [t, locale, onViewAccount, onEditAccount, onArchiveAccount]);

  const title = t('categories_table_title');
  const description = t('categories_table_description');
  const search_label = t('categories_search_label');
  const filter_label = t('categories_type_filter_label');
  const empty_title = t('categories_empty_title');
  const empty_description = t('categories_empty_description');
  const loading_label = t('categories_table_loading_label');

  const total_text = t('categories_total_count', {
    count: accounts?.meta.total ?? 0,
  });

  const tabs = [
    { value: 'all', label: t('categories_all_label') },
    { value: 'revenue', label: t('categories_revenue_type_label') },
    { value: 'expense', label: t('categories_expenses_label') },
  ];

  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-6 md:gap-8"
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="w-full max-w-sm">
          <SearchField
            type="search"
            aria-label={search_label}
            placeholder={search_label}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Tabs
          ariaLabel={filter_label}
          value={type}
          onValueChange={onTypeChange}
          items={tabs}
        />
      </div>
      <div aria-busy={loading}>
        {loading && (
          <span role="status" className="sr-only">
            {loading_label}
          </span>
        )}
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyStateNode={
            <Empty className="border-none max-w-md my-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox aria-hidden />
                </EmptyMedia>
                <EmptyTitle>{empty_title}</EmptyTitle>
                <EmptyDescription>{empty_description}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        />
      </div>
      {accounts && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{total_text}</p>
          <TablePagination
            meta={accounts.meta}
            onPageChange={onPageChange}
            className="mx-0 w-auto justify-end"
          />
        </div>
      )}
    </section>
  );
}
