import type { ITableFilterOption } from '@/shared/components/table-filter';
import type { TablePaginationProps } from '@/shared/components/table-pagination';
import type { CSSProperties, ReactNode } from 'react';

export interface IDataWithId {
  id: string | number;
}
export type USortDirection = 'asc' | 'desc' | null;
export type TTableFilters = Record<string, (string | number)[]>;
export interface ITableColumn<T extends IDataWithId> {
  dataIndex: keyof T;
  title?: string;
  /** Accessible name when a custom header has no text label. */
  ariaLabel?: string;
  /** Fixed width in pixels. Takes precedence over proportion. */
  width?: number;
  /** Relative share of the space remaining after fixed-width columns. */
  proportion?: number;
  minWidth?: number;
  /** @deprecated Use proportion. */
  span?: number;
  align?: 'left' | 'center' | 'right';
  tooltip?: string;
  sortable?: boolean;
  render?: (cellData: unknown, rowData: T) => ReactNode;
  headerRender?: (column: ITableColumn<T>) => ReactNode;
  /** @deprecated Use headerRender. */
  renderHeader?: (column: ITableColumn<T>) => ReactNode;
  testId?: string;
  hidden?: boolean;
  filterable?: boolean;
  filterMultiple?: boolean;
  filterOptions?: ITableFilterOption[];
  filterValue?: (string | number)[];
  onFilterChange?: (values: (string | number)[]) => void;
}
export interface IStickyProps {
  top?: string | number;
  zIndex?: number;
  className?: string;
}
export interface TableProps<T extends IDataWithId> {
  columns: ITableColumn<T>[];
  /** Already sorted, filtered, and paginated by the owner. */
  data: T[];
  currentSortKey?: string;
  currentSortDirection?: USortDirection;
  onSortChange?: (key: keyof T, direction: USortDirection) => void;
  filters?: TTableFilters;
  onFilterChange?: (filters: TTableFilters) => void;
  pagination?: TablePaginationProps;
  rowHeight?: number;
  headerHeight?: number;
  headerFontSize?: number;
  bodyFontSize?: number;
  emptyStateNode?: ReactNode;
  loadingStateNode?: ReactNode;
  loading?: boolean;
  stickyProps?: IStickyProps;
  stickyHeader?: boolean;
  /** Kept for compatibility; wide tables always contain horizontal overflow. */
  responsive?: boolean;
  selectable?: boolean;
  selectedRowIds?: (string | number)[];
  onRowSelectionChange?: (selectedIds: (string | number)[]) => void;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
}
export interface DataTableSkeletonProps {
  columnsCount: number;
  showSelection?: boolean;
  rowsCount?: number;
}
export interface DataTableHeaderCellProps<T extends IDataWithId> {
  column: ITableColumn<T>;
  direction: USortDirection;
  onSort: (key: keyof T) => void;
  filterValues: (string | number)[];
  onFilter: (column: ITableColumn<T>, values: (string | number)[]) => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}
export interface DataTableRowProps<T extends IDataWithId> {
  row: T;
  columns: ITableColumn<T>[];
  selectable: boolean;
  selected: boolean;
  onSelect: (id: string | number) => void;
}
export interface IColumnLayout {
  widths: (number | string)[];
  minWidth: number;
}

export type DataTableRowSkeletonProps = Pick<
  DataTableSkeletonProps,
  'columnsCount' | 'showSelection'
>;
