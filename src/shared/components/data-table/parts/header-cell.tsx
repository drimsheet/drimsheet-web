import { Button } from '@/shared/components/button';
import { TableHead } from '@/shared/components/table';
import { TableFilter } from '@/shared/components/table-filter';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import { cn } from '@/shared/lib/utils/cn';
import { ArrowDown, ArrowUp, ArrowUpDown, CircleHelp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dataTableHelpers from '../helper';
import type { DataTableHeaderCellProps, IDataWithId } from '../types';

export function DataTableHeaderCell<T extends IDataWithId>({
  column,
  direction,
  onSort,
  filterValues,
  onFilter,
  disabled,
  style,
  className,
}: Readonly<DataTableHeaderCellProps<T>>) {
  const { t } = useTranslation('shared');
  const content = dataTableHelpers.header(column);
  const label = column.ariaLabel ?? column.title ?? String(column.dataIndex);
  const sort_label = t('table_sort_label', { column: label });
  const help_label = t('table_column_help_label', { column: label });
  const sortIcon = direction === 'asc' ? ArrowUp : ArrowDown;
  const SortIcon = direction ? sortIcon : ArrowUpDown;
  const ariaSort = direction === 'asc' ? 'ascending' : 'descending';

  return (
    <TableHead
      scope="col"
      aria-sort={direction ? ariaSort : undefined}
      style={{ ...style, textAlign: column.align }}
      className={cn(
        'h-(--table-header-height) bg-muted px-4 text-[length:var(--table-header-font-size)] font-medium text-muted-foreground',
        className
      )}
      data-testid={column.testId ?? `column-header-${String(column.dataIndex)}`}
    >
      <div
        className={cn(
          'flex min-w-0 items-center gap-2',
          column.align === 'right' && 'justify-end',
          column.align === 'center' && 'justify-center'
        )}
      >
        {column.sortable ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSort(column.dataIndex)}
            aria-label={sort_label}
            className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-sm text-inherit [font:inherit] [text-transform:inherit] [letter-spacing:inherit] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 pointer-coarse:min-h-11"
          >
            <span className="whitespace-normal">{content}</span>
            <SortIcon className="size-3.5 shrink-0" aria-hidden />
          </button>
        ) : (
          <span className="whitespace-normal">{content}</span>
        )}
        {column.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={help_label}
              >
                <CircleHelp aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{column.tooltip}</TooltipContent>
          </Tooltip>
        )}
        {column.filterable && column.filterOptions && (
          <TableFilter
            title={label}
            multiple={column.filterMultiple}
            options={column.filterOptions}
            selectedValues={filterValues}
            onApply={(values) => onFilter(column, values)}
            disabled={disabled}
          />
        )}
      </div>
    </TableHead>
  );
}
