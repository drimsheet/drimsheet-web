import { Checkbox } from '@/shared/components/checkbox';
import { Skeleton } from '@/shared/components/skeleton';
import { TableCell, TableRow } from '@/shared/components/table';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';
import dataTableHelpers from '../helper';
import type {
  DataTableRowProps,
  DataTableRowSkeletonProps,
  IDataWithId,
} from '../types';

export function DataTableRow<T extends IDataWithId>({
  row,
  columns,
  selectable,
  selected,
  onSelect,
}: Readonly<DataTableRowProps<T>>) {
  const { t } = useTranslation('shared');

  const selection_label = t(selected ? 'deselect_row' : 'select_row', {
    id: row.id,
  });

  return (
    <TableRow
      data-state={selected ? 'selected' : undefined}
      className={cn(
        'group/row border-border hover:bg-accent',
        selected &&
          'bg-selection hover:bg-selection-hover data-[state=selected]:bg-selection'
      )}
    >
      {selectable && (
        <TableCell className="px-4">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(row.id)}
            aria-label={selection_label}
          />
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell
          key={String(column.dataIndex)}
          style={{ textAlign: column.align }}
          className={cn(
            'h-(--table-row-height) px-4 py-2.5 text-[length:var(--table-body-font-size)] font-normal whitespace-normal break-words',
            column.align === 'right' && 'tabular-nums'
          )}
        >
          {dataTableHelpers.cell(column, row)}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTableRowSkeleton({
  columnsCount,
  showSelection = false,
}: Readonly<DataTableRowSkeletonProps>) {
  return (
    <TableRow className="hover:bg-transparent">
      {showSelection && (
        <TableCell className="px-4">
          <Skeleton className="size-4" />
        </TableCell>
      )}
      {Array.from({ length: columnsCount }, (_, column) => (
        <TableCell
          key={column}
          className="h-(--table-row-height,60px) px-4 py-2.5"
        >
          <Skeleton className="h-4 w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  );
}
