import { Checkbox } from '@/shared/components/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/table';
import { TablePagination } from '@/shared/components/table-pagination';
import { cn } from '@/shared/lib/utils/cn';
import { Inbox } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import dataTableHelpers from './helper';
import { DataTableRow, DataTableRowSkeleton } from './parts/data-row';
import { DataTableHeaderCell } from './parts/header-cell';
import type { IDataWithId, ITableColumn, TableProps } from './types';

export function DataTable<T extends IDataWithId>({
  columns,
  data,
  currentSortKey,
  currentSortDirection = null,
  onSortChange,
  filters = {},
  onFilterChange,
  pagination,
  rowHeight = 60,
  headerHeight = 42,
  headerFontSize = 11,
  bodyFontSize = 14,
  emptyStateNode,
  loadingStateNode,
  loading = false,
  stickyProps,
  stickyHeader = false,
  selectable = false,
  selectedRowIds = [],
  onRowSelectionChange,
  className,
  'data-testid': dataTestId = 'data-table',
  'aria-label': ariaLabel,
}: Readonly<TableProps<T>>) {
  const { t } = useTranslation('shared');
  const visibleColumns = columns.filter((column) => !column.hidden);
  const layout = dataTableHelpers.layout(visibleColumns, selectable);

  const allSelected =
    data.length > 0 && data.every((row) => selectedRowIds.includes(row.id));

  const someSelected = data.some((row) => selectedRowIds.includes(row.id));
  const selectionState = someSelected ? 'indeterminate' : false;

  const stickyStyle: CSSProperties | undefined =
    stickyHeader || stickyProps
      ? {
          position: 'sticky',
          top: stickyProps?.top ?? 0,
          zIndex: stickyProps?.zIndex ?? 10,
        }
      : undefined;

  const style = {
    '--table-row-height': `${rowHeight}px`,
    '--table-header-height': `${headerHeight}px`,
    '--table-header-font-size': `${headerFontSize}px`,
    '--table-body-font-size': `${bodyFontSize}px`,
  } as CSSProperties;

  const handleSelectRow = (id: string | number) => {
    const selection = new Set(selectedRowIds);
    if (selection.has(id)) {
      selection.delete(id);
    } else {
      selection.add(id);
    }

    onRowSelectionChange?.([...selection]);
  };

  const handleSelectAll = () => {
    const selection = new Set(selectedRowIds);
    for (const row of data) {
      if (allSelected) {
        selection.delete(row.id);
      } else {
        selection.add(row.id);
      }
    }

    onRowSelectionChange?.([...selection]);
  };

  const handleSort = (key: keyof T) => {
    const direction = currentSortKey === key ? currentSortDirection : null;
    onSortChange?.(key, dataTableHelpers.nextSort(direction));
  };

  const handleFilter = (
    column: ITableColumn<T>,
    values: (string | number)[]
  ) => {
    if (column.onFilterChange) {
      column.onFilterChange(values);
    } else {
      onFilterChange?.(
        dataTableHelpers.filters(filters, String(column.dataIndex), values)
      );
    }

    if (pagination && pagination.meta.page !== 1) {
      pagination.onPageChange(1);
    }
  };

  const selection_label = t(
    allSelected ? 'deselect_all_rows' : 'select_all_rows'
  );

  const empty_title = t('no_records_found');
  const empty_description = t('no_records_description');

  return (
    <div
      className={cn(
        'min-w-0 w-full space-y-2 bg-background text-foreground font-sans',
        className
      )}
      style={style}
      data-testid={dataTestId}
      aria-busy={loading}
    >
      <div className="overflow-hidden rounded-md border border-border">
        <Table
          className="w-full table-fixed border-collapse"
          style={{
            minWidth: layout.minWidth,
            width:
              visibleColumns.length > 0 &&
              visibleColumns.every((column) => column.width !== undefined)
                ? layout.minWidth
                : undefined,
          }}
          aria-label={ariaLabel}
        >
          <colgroup>
            {selectable && <col style={{ width: 48 }} />}
            {visibleColumns.map((column, index) => (
              <col
                key={String(column.dataIndex)}
                style={{ width: layout.widths[index] }}
              />
            ))}
          </colgroup>
          <TableHeader className="bg-muted uppercase tracking-[0.07em]">
            <TableRow className="border-border hover:bg-transparent">
              {selectable && (
                <TableHead
                  scope="col"
                  className="h-(--table-header-height) bg-muted px-4"
                  style={stickyStyle}
                >
                  <Checkbox
                    checked={allSelected || selectionState}
                    disabled={loading || !data.length}
                    onCheckedChange={handleSelectAll}
                    aria-label={selection_label}
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <DataTableHeaderCell
                  key={String(column.dataIndex)}
                  column={column}
                  direction={
                    currentSortKey === column.dataIndex
                      ? currentSortDirection
                      : null
                  }
                  onSort={handleSort}
                  filterValues={
                    column.filterValue ??
                    filters[String(column.dataIndex)] ??
                    []
                  }
                  onFilter={handleFilter}
                  disabled={loading}
                  style={stickyStyle}
                  className={stickyProps?.className}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              (loadingStateNode ??
                Array.from({ length: 5 }, (_, row) => (
                  <DataTableRowSkeleton
                    key={row}
                    columnsCount={visibleColumns.length}
                    showSelection={selectable}
                  />
                )))}
            {!loading && !data.length && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={Math.max(
                    1,
                    visibleColumns.length + Number(selectable)
                  )}
                  className="whitespace-normal p-0 border-none"
                >
                  <div className="flex w-full items-center justify-center p-8">
                    {emptyStateNode ?? (
                      <Empty className="border-none max-w-md my-4">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Inbox className="size-6 text-muted-foreground" />
                          </EmptyMedia>
                          <EmptyTitle className="text-foreground">
                            {empty_title}
                          </EmptyTitle>
                          <EmptyDescription className="text-muted-foreground text-xs">
                            {empty_description}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.map((row) => (
                <DataTableRow
                  key={row.id}
                  row={row}
                  columns={visibleColumns}
                  selectable={selectable}
                  selected={selectedRowIds.includes(row.id)}
                  onSelect={handleSelectRow}
                />
              ))}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <TablePagination
          {...pagination}
          disabled={loading || pagination.disabled}
        />
      )}
    </div>
  );
}
