import {
  DataTable,
  type IDataWithId,
  type ITableColumn,
  type TableProps,
  type TTableFilters,
  type USortDirection,
} from '@/shared/components/data-table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

interface IExampleRow {
  id: number;
  name: string;
  account: string;
  amount: number;
}

const rows: IExampleRow[] = [
  { id: 1, name: 'Acme Studio', account: 'Operating', amount: 425000 },
  { id: 2, name: 'Figma', account: 'Operating', amount: 24500 },
  { id: 3, name: 'Studio equipment', account: 'Savings', amount: 210000 },
  { id: 4, name: 'Northstar Ltd.', account: 'Operating', amount: 280000 },
  { id: 5, name: 'Monthly reserve', account: 'Savings', amount: 150000 },
];

const columns: ITableColumn<IExampleRow>[] = [
  {
    dataIndex: 'name',
    title: 'Summary',
    proportion: 2.5,
    minWidth: 200,
    sortable: true,
  },
  {
    dataIndex: 'account',
    title: 'Account',
    proportion: 1.5,
    minWidth: 180,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: 'Operating', value: 'Operating' },
      { label: 'Savings', value: 'Savings' },
    ],
  },
  {
    dataIndex: 'amount',
    title: 'Amount · NGN',
    align: 'right',
    proportion: 1.5,
    minWidth: 160,
    sortable: true,
    render: (value) =>
      Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2 }),
  },
];

interface ControlledDataTableWrapperProps<
  T extends IDataWithId,
> extends TableProps<T> {
  paginate?: boolean;
}
export function ControlledDataTableWrapper<T extends IDataWithId>({
  data,
  columns,
  filters: controlledFilters,
  currentSortKey: controlledKey,
  currentSortDirection: controlledDirection,
  selectedRowIds: controlledSelection,
  paginate = false,
  ...props
}: ControlledDataTableWrapperProps<T>) {
  const [localFilters, setFilters] = useState<TTableFilters>({});
  const [localKey, setKey] = useState<string>();
  const [localDirection, setDirection] = useState<USortDirection>(null);
  const [localSelection, setSelection] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(1);
  const filters = controlledFilters ?? localFilters;
  const key = controlledKey ?? localKey;

  const direction =
    controlledDirection === undefined ? localDirection : controlledDirection;

  const filtered = useMemo(() => {
    const result = data.filter((row) =>
      Object.entries(filters).every(
        ([key, values]) =>
          !values.length ||
          values.includes(row[key as keyof T] as string | number)
      )
    );

    if (key && direction)
      result.sort((a, b) => {
        const left = a[key as keyof T],
          right = b[key as keyof T];

        const compared =
          typeof left === 'number' && typeof right === 'number'
            ? left - right
            : String(left).localeCompare(String(right));

        return direction === 'asc' ? compared : -compared;
      });

    return result;
  }, [data, filters, key, direction]);

  const handleSort = (key: keyof T, direction: USortDirection) => {
    setKey(String(key));
    setDirection(direction);
    setPage(1);
  };

  const handleFilter = (filters: TTableFilters) => {
    setFilters(filters);
    setPage(1);
  };

  return (
    <DataTable
      {...props}
      columns={columns}
      data={paginate ? filtered.slice((page - 1) * 2, page * 2) : filtered}
      filters={filters}
      onFilterChange={handleFilter}
      currentSortKey={key}
      currentSortDirection={direction}
      onSortChange={handleSort}
      selectedRowIds={controlledSelection ?? localSelection}
      onRowSelectionChange={setSelection}
      pagination={
        paginate
          ? {
              meta: {
                page,
                limit: 2,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / 2),
              },
              onPageChange: setPage,
              unfilteredTotal: data.length,
            }
          : undefined
      }
    />
  );
}

const meta = {
  title: 'Shared UI/DataTable',
  component: DataTable<IExampleRow>,
  tags: ['autodocs'],
  args: { columns, data: rows },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable<IExampleRow>>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => <ControlledDataTableWrapper {...args} />,
};
export const InteractiveSortingAndFiltering: Story = {
  render: (args) => <ControlledDataTableWrapper {...args} paginate />,
};
export const Selection: Story = {
  render: (args) => (
    <ControlledDataTableWrapper {...args} selectable paginate />
  ),
};
export const LoadingState: Story = { args: { data: [], loading: true } };
export const EmptyState: Story = { args: { data: [] } };
export const CustomHeadersAndSizing: Story = {
  args: {
    rowHeight: 48,
    headerFontSize: 12,
    bodyFontSize: 13,
    columns: [
      {
        ...columns[0],
        proportion: 3,
        headerRender: () => <span>Transaction summary</span>,
        tooltip: 'The transaction description',
      },
      { ...columns[1], width: 200 },
      columns[2],
    ],
  },
};
export const LongContent: Story = {
  args: {
    data: [
      {
        id: 1,
        name: 'An unusually long transaction description that remains readable at narrow widths',
        account: 'Operating',
        amount: 1234567890.12,
      },
    ],
  },
};
