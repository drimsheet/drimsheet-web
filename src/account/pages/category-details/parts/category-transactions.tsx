import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import { FormattedDate } from '@/shared/components/date';
import { Money } from '@/shared/components/money';
import { PageSection } from '@/shared/components/page-section';
import { SearchField } from '@/shared/components/search-field';
import { TablePagination } from '@/shared/components/table-pagination';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import categoryDetailsHelpers from '../helper';
import type { CategoryTransactionsProps, ICategoryTransaction } from '../types';

export function CategoryTransactions({
  transactions,
  selectedCounterparty,
  onClearCounterparty,
  transactionsHref,
}: Readonly<CategoryTransactionsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(
    () =>
      categoryDetailsHelpers.filterTransactions(
        transactions,
        search,
        null,
        direction
      ),
    [transactions, search, direction]
  );

  const totalPages = Math.ceil(filtered.length / 10);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  const columns: ITableColumn<ICategoryTransaction>[] = [
    {
      dataIndex: 'effectiveDate',
      title: t('details_date_label'),
      sortable: true,
      render: (_, row) => <FormattedDate value={new Date(row.effectiveDate)} />,
    },
    {
      dataIndex: 'counterparties',
      title: t('category_details_counterparty_label'),
      render: (_, row) =>
        row.counterparties
          .map(
            ({ id, name }) =>
              name ??
              t(
                id === 'self'
                  ? 'category_details_self_label'
                  : 'category_details_unassigned_label'
              )
          )
          .join(', '),
    },
    {
      dataIndex: 'description',
      title: t('details_description_label'),
      render: (_, row) =>
        row.description ?? t('details_transaction_description_fallback'),
    },
    {
      dataIndex: 'status',
      title: t('categories_status_label'),
      render: (_, row) => (
        <Badge variant="secondary">
          {t(`details_transaction_status_${row.status}`)}
        </Badge>
      ),
    },
    {
      dataIndex: 'amount',
      title: t('details_amount_label'),
      render: (_, row) => <Money value={row.amount} className="tabular-nums" />,
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (
    _key: keyof ICategoryTransaction,
    value: 'asc' | 'desc' | null
  ) => {
    setDirection(value ?? 'desc');
    setPage(1);
  };

  const title = t('categories_transactions_label');
  const search_label = t('category_details_search_label');
  const view_label = t('categories_view_transactions_label');

  const clear_label = t('category_details_clear_filter_label', {
    name: selectedCounterparty,
  });

  const count_text = t('category_details_table_count_text', {
    count: filtered.length,
  });

  return (
    <PageSection title={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <SearchField
            aria-label={search_label}
            placeholder={search_label}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>
        {transactionsHref && (
          <Button variant="link" asChild>
            <a href={transactionsHref}>{view_label}</a>
          </Button>
        )}
        {selectedCounterparty !== null && (
          <Button variant="outline" size="sm" onClick={onClearCounterparty}>
            {clear_label}
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={rows}
        currentSortKey="effectiveDate"
        currentSortDirection={direction}
        onSortChange={handleSortChange}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {count_text}
        </p>
        <TablePagination
          meta={{
            page: currentPage,
            limit: 10,
            total: filtered.length,
            totalPages,
          }}
          onPageChange={setPage}
        />
      </div>
    </PageSection>
  );
}
