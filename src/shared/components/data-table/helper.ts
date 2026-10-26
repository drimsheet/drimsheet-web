import type { ReactNode } from 'react';
import type {
  IColumnLayout,
  IDataWithId,
  ITableColumn,
  TTableFilters,
  USortDirection,
} from './types';

function positive(value: number | undefined, fallback: number) {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function layout<T extends IDataWithId>(
  columns: ITableColumn<T>[],
  selectable = false
): IColumnLayout {
  const fixed = columns.map((column) =>
    column.width === undefined
      ? 0
      : Math.max(positive(column.width, 64), positive(column.minWidth, 0))
  );

  const weights = columns.map((column, index) =>
    fixed[index] ? 0 : positive(column.proportion ?? column.span, 1)
  );

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const fixedWidth = fixed.reduce(
    (sum, width) => sum + width,
    selectable ? 48 : 0
  );

  let flexibleMinimum = 0;

  const widths = columns.map((column, index) => {
    if (fixed[index]) {
      return fixed[index];
    }

    const ratio = weights[index] / totalWeight;
    const minimum = positive(column.minWidth, column.filterable ? 180 : 140);
    flexibleMinimum = Math.max(flexibleMinimum, minimum / ratio);

    return `calc(${ratio * 100}% - ${fixedWidth * ratio}px)`;
  });

  return { widths, minWidth: Math.ceil(fixedWidth + flexibleMinimum) };
}

function nextSort(direction: USortDirection): USortDirection {
  if (direction === 'asc') {
    return 'desc';
  }

  if (direction === 'desc') {
    return null;
  }

  return 'asc';
}

function filters(
  current: TTableFilters,
  key: string,
  values: (string | number)[]
) {
  const result = { ...current };
  if (values.length) {
    result[key] = values;
  } else {
    delete result[key];
  }

  return result;
}

function header<T extends IDataWithId>(column: ITableColumn<T>): ReactNode {
  if (column.headerRender) {
    return column.headerRender(column);
  }

  if (column.renderHeader) {
    return column.renderHeader(column);
  }

  return column.title;
}

function cell<T extends IDataWithId>(
  column: ITableColumn<T>,
  row: T
): ReactNode {
  const value = row[column.dataIndex];
  if (column.render) {
    return column.render(value, row);
  }

  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

export default Object.freeze({ layout, nextSort, filters, header, cell });
