import { ArrowLeftRight, ChevronRight } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TransactionDetailsDrawer } from '@/journal-entries/components/transaction-details-drawer';
import { BalanceEffectIcon } from '@/shared/components/balance-effect-icon';
import { Button } from '@/shared/components/button';
import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import { FormattedDate } from '@/shared/components/date';
import { ItemMedia } from '@/shared/components/item';
import { Money } from '@/shared/components/money';
import { SearchField } from '@/shared/components/search-field';
import { TablePagination } from '@/shared/components/table-pagination';
import {
  EJournalEntrySourceType,
  ELedgerAccountBalanceEffect,
  type IJournalEntryListDto,
} from '@/shared/lib/api/Api';
import transactionsTableHelpers from './helper';
import { TransactionSummary } from './parts/transaction-summary';
import { TransactionsTableSkeleton } from './skeleton';
import type { ITransactionsTableRow, TransactionsTableProps } from './types';

export function TransactionsTable({
  actionButton,
  data,
  loading = false,
  archiving = false,
  onArchiveTransaction,
  onDeleteTransaction,
  pagination,
  onEditTransaction,
  onPageChange,
  onSortChange,
  currentSortDirection = null,
  className,
  'data-testid': dataTestId = 'transactions-table',
  searchValue = '',
  onSearchChange,
}: Readonly<TransactionsTableProps>) {
  const { t } = useTranslation(['journal-entries', 'shared']);

  const [selectedTransaction, setSelectedTransaction] =
    useState<IJournalEntryListDto | null>(null);

  const rows = useMemo(
    () => transactionsTableHelpers.createRows({ entries: data }),
    [data]
  );

  const selectedDetails = useMemo(
    () =>
      selectedTransaction
        ? transactionsTableHelpers.createDetails(selectedTransaction)
        : undefined,
    [selectedTransaction]
  );

  const handleSortChange = useCallback(
    (key: keyof ITransactionsTableRow, direction: 'asc' | 'desc' | null) => {
      if (key === 'effectiveDate') {
        onSortChange?.('effectiveDate', direction);
      }
    },
    [onSortChange]
  );

  const handleTransactionOpen = useCallback(
    (entry: IJournalEntryListDto) => setSelectedTransaction(entry),
    []
  );

  const handleDetailsOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedTransaction(null);
  }, []);

  const handleSelectedTransactionEdit = useCallback(() => {
    if (!selectedTransaction) return;

    onEditTransaction?.(selectedTransaction);
  }, [onEditTransaction, selectedTransaction]);

  const handleSelectedTransactionArchive = async () => {
    if (!selectedTransaction || !onArchiveTransaction || archiving) return;

    await onArchiveTransaction(selectedTransaction);
    setSelectedTransaction(null);
  };

  const handleSelectedTransactionDelete = async () => {
    if (!selectedTransaction || !onDeleteTransaction) return;

    await onDeleteTransaction(selectedTransaction);
    setSelectedTransaction(null);
  };

  const columns = useMemo<ITableColumn<ITransactionsTableRow>[]>(() => {
    const directionLabel = t('transactions_table_direction_label');
    const dateLabel = t('shared:date');
    const accountLabel = t('transactions_table_account_label');
    const summaryLabel = t('transactions_table_summary_label');
    const amountLabel = t('amount_label');
    const incomingLabel = t('transactions_table_incoming_direction_label');
    const outgoingLabel = t('transactions_table_outgoing_direction_label');
    const transferLabel = t('transactions_table_transfer_direction_label');
    const openTransactionLabel = t('transactions_table_open_action');

    const tableColumns: ITableColumn<ITransactionsTableRow>[] = [
      {
        dataIndex: 'direction',
        headerRender: () => <span className="sr-only">{directionLabel}</span>,
        render: (_, row) => {
          if (row.direction === EJournalEntrySourceType.Receipt) {
            return (
              <BalanceEffectIcon
                effect={ELedgerAccountBalanceEffect.Increase}
                className="size-8 [&_svg]:size-4"
                role="img"
                aria-label={incomingLabel}
                title={incomingLabel}
              />
            );
          }

          if (row.direction === EJournalEntrySourceType.Payment) {
            return (
              <BalanceEffectIcon
                effect={ELedgerAccountBalanceEffect.Decrease}
                className="size-8 [&_svg]:size-4"
                role="img"
                aria-label={outgoingLabel}
                title={outgoingLabel}
              />
            );
          }

          return (
            <ItemMedia
              className="size-8 rounded-full bg-info/10"
              role="img"
              aria-label={transferLabel}
              title={transferLabel}
            >
              <ArrowLeftRight className="size-4 text-info" />
            </ItemMedia>
          );
        },
      },
      {
        dataIndex: 'effectiveDate',
        title: dateLabel,
        sortable: true,
        render: (value) => (
          <FormattedDate
            value={new Date(String(value))}
            className="whitespace-nowrap"
          />
        ),
      },
      {
        dataIndex: 'accountName',
        title: accountLabel,
      },
      {
        dataIndex: 'summary',
        title: summaryLabel,
        render: (_, row) => <TransactionSummary row={row} />,
      },
      {
        dataIndex: 'amount',
        title: amountLabel,
        render: (value) => (
          <Money
            className="text-foreground text-sm font-heading"
            value={value as ITransactionsTableRow['amount']}
          />
        ),
      },
    ];

    tableColumns.push({
      dataIndex: 'action',
      title: '',
      render: (_, row) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={openTransactionLabel}
          title={openTransactionLabel}
          onClick={() => handleTransactionOpen(row.entry)}
        >
          <ChevronRight />
        </Button>
      ),
    });

    return tableColumns;
  }, [handleTransactionOpen, t]);

  const searchPlaceholder = t('transactions_table_search_placeholder');

  if (loading) return <TransactionsTableSkeleton />;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <SearchField
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        {actionButton}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        onSortChange={handleSortChange}
        currentSortKey="effectiveDate"
        currentSortDirection={currentSortDirection}
        className={className}
        data-testid={dataTestId}
      />

      {pagination && onPageChange && (
        <TablePagination
          meta={pagination}
          onPageChange={onPageChange}
          className="mx-0 w-auto justify-end"
        />
      )}

      <TransactionDetailsDrawer
        archiving={archiving}
        onArchive={
          onArchiveTransaction ? handleSelectedTransactionArchive : undefined
        }
        onDelete={
          onDeleteTransaction ? handleSelectedTransactionDelete : undefined
        }
        details={selectedDetails}
        editDisabled={!onEditTransaction}
        onEdit={handleSelectedTransactionEdit}
        onOpenChange={handleDetailsOpenChange}
        open={Boolean(selectedDetails)}
      />
    </div>
  );
}
