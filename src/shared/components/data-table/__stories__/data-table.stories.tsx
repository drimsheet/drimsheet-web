import {
  DataTable,
  type IDataWithId,
  type ITableColumn,
} from '@/shared/components/data-table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

interface IMockRow {
  id: string | number;
  name: string;
  currency: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  balance: number;
  createdOn: string;
}

const mockData: IMockRow[] = [
  {
    id: 1,
    name: 'Some name',
    currency: 'NGN',
    status: 'ACTIVE',
    balance: 3000,
    createdOn: 'Yesterday',
  },
  {
    id: 2,
    name: 'Another name',
    currency: 'NGN',
    status: 'ACTIVE',
    balance: 4500,
    createdOn: '12 Jan, 2026',
  },
  {
    id: 3,
    name: 'Standard USD Ledger',
    currency: 'USD',
    status: 'ACTIVE',
    balance: 2450,
    createdOn: '12 Jan, 2026',
  },
  {
    id: 4,
    name: 'Secondary USD Savings',
    currency: 'USD',
    status: 'PENDING',
    balance: 100,
    createdOn: '15 Jan, 2026',
  },
  {
    id: 5,
    name: 'GBP Settlement Account',
    currency: 'GBP',
    status: 'INACTIVE',
    balance: 0,
    createdOn: '01 Feb, 2026',
  },
];

const columns: ITableColumn<IMockRow>[] = [
  {
    dataIndex: 'name',
    title: 'Name',
    sortable: true,
    tooltip: 'The user-assigned description or name of the account ledger',
  },
  {
    dataIndex: 'currency',
    title: 'Currency',
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: 'NGN - Nigerian Naira', value: 'NGN' },
      { label: 'USD - US Dollar', value: 'USD' },
      { label: 'GBP - British Pound', value: 'GBP' },
    ],
  },
  {
    dataIndex: 'status',
    title: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Pending', value: 'PENDING' },
      { label: 'Inactive', value: 'INACTIVE' },
    ],
    render: (value) => {
      const status = value as IMockRow['status'];

      const colors = {
        ACTIVE:
          'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border-emerald-500/20',
        PENDING:
          'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border-amber-500/20',
        INACTIVE:
          'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20 border-gray-500/20',
      };

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    dataIndex: 'balance',
    title: 'Balance',
    sortable: true,
    render: (value, row) => {
      const num = value as number;

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: row.currency,
      }).format(num);

      return (
        <span className="font-mono font-bold text-foreground">{formatted}</span>
      );
    },
  },
  {
    dataIndex: 'createdOn',
    title: 'Created On',
    sortable: true,
  },
];

// Controlled wrapper for interactive client-side sorting/filtering/selection
export interface IControlledDataTableWrapperProps<T extends IDataWithId> {
  columns: ITableColumn<T>[];
  data: T[];
  filters?: Record<string, (string | number)[]>;
  currentSortKey?: string;
  currentSortDirection?: 'asc' | 'desc' | null;
  selectedRowIds?: (string | number)[];
}

export const ControlledDataTableWrapper = <T extends IDataWithId>({
  columns,
  data: initialData,
  filters: initialFilters = {},
  currentSortKey: initialSortKey,
  currentSortDirection: initialSortDirection = null,
  selectedRowIds: initialSelectedRowIds = [],
  ...props
}: IControlledDataTableWrapperProps<T>) => {
  const [currentSortKey, setCurrentSortKey] = React.useState<
    string | undefined
  >(initialSortKey);

  const [currentSortDirection, setCurrentSortDirection] = React.useState<
    'asc' | 'desc' | null
  >(initialSortDirection);

  const [filters, setFilters] =
    React.useState<Record<string, (string | number)[]>>(initialFilters);

  const [selectedRowIds, setSelectedRowIds] = React.useState<
    (string | number)[]
  >(initialSelectedRowIds);

  React.useEffect(() => {
    setCurrentSortKey((prev) =>
      prev === initialSortKey ? prev : initialSortKey
    );
  }, [initialSortKey]);

  React.useEffect(() => {
    setCurrentSortDirection((prev) =>
      prev === initialSortDirection ? prev : initialSortDirection
    );
  }, [initialSortDirection]);

  React.useEffect(() => {
    setFilters((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(initialFilters)) {
        return prev;
      }

      return initialFilters;
    });
  }, [initialFilters]);

  React.useEffect(() => {
    setSelectedRowIds((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(initialSelectedRowIds)) {
        return prev;
      }

      return initialSelectedRowIds;
    });
  }, [initialSelectedRowIds]);

  // Parent filters and sorts the data client-side
  const processedData = React.useMemo(() => {
    let result = [...initialData];

    // 1. Filter
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter((row) => {
          const val = row[key as keyof T];

          return values.includes(val as string | number);
        });
      }
    });

    // 2. Sort
    if (currentSortKey && currentSortDirection) {
      result.sort((a, b) => {
        const valA = a[currentSortKey as keyof T];
        const valB = b[currentSortKey as keyof T];
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }

        return currentSortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [initialData, filters, currentSortKey, currentSortDirection]);

  return (
    <DataTable
      columns={columns}
      data={processedData}
      currentSortKey={currentSortKey}
      currentSortDirection={currentSortDirection}
      onSortChange={(key, dir) => {
        setCurrentSortKey(String(key));
        setCurrentSortDirection(dir);
      }}
      filters={filters}
      onFilterChange={setFilters}
      selectedRowIds={selectedRowIds}
      onRowSelectionChange={setSelectedRowIds}
      {...props}
    />
  );
};

const meta = {
  title: 'Shared UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl p-6 bg-background rounded-2xl border border-border/80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: columns as unknown as ITableColumn<IDataWithId>[],
    data: mockData as IDataWithId[],
    selectable: true,
    stickyHeader: true,
  },
};

export const WithoutSelection: Story = {
  args: {
    columns: columns as unknown as ITableColumn<IDataWithId>[],
    data: mockData as IDataWithId[],
    selectable: false,
  },
};

export const InteractiveSelection: Story = {
  args: {
    columns: [],
    data: [],
  },
  render: () => {
    const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([
      2, 4,
    ]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm bg-muted/30 border border-border px-4 py-2 rounded-lg">
          <span className="font-semibold text-foreground">
            Selected Item IDs:
          </span>
          <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            [{selectedIds.join(', ')}]
          </span>
        </div>
        <DataTable
          columns={columns as unknown as ITableColumn<IDataWithId>[]}
          data={mockData as IDataWithId[]}
          selectable={true}
          selectedRowIds={selectedIds}
          onRowSelectionChange={setSelectedIds}
        />
      </div>
    );
  },
};

export const LoadingState: Story = {
  args: {
    columns: columns as unknown as ITableColumn<IDataWithId>[],
    data: [],
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    columns: columns as unknown as ITableColumn<IDataWithId>[],
    data: [],
    loading: false,
  },
};

export const InteractiveSortingAndFiltering: Story = {
  args: {
    columns: [],
    data: [],
  },
  render: () => {
    return (
      <ControlledDataTableWrapper
        columns={columns as unknown as ITableColumn<IDataWithId>[]}
        data={mockData as IDataWithId[]}
      />
    );
  },
};
