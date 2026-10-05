import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import { ControlledDataTableWrapper } from '@/shared/components/data-table/__stories__/data-table.stories';

interface ITestRow {
  id: string | number;
  name: string;
  category: string;
  value: number;
}

const mockData: ITestRow[] = [
  { id: 1, name: 'Apple', category: 'Fruit', value: 1.2 },
  { id: 2, name: 'Banana', category: 'Fruit', value: 0.8 },
  { id: 3, name: 'Carrot', category: 'Vegetable', value: 1.5 },
];

const columns: ITableColumn<ITestRow>[] = [
  {
    dataIndex: 'name',
    title: 'Name',
    sortable: true,
  },
  {
    dataIndex: 'category',
    title: 'Category',
    filterable: true,
    filterOptions: [
      { label: 'Fruit', value: 'Fruit' },
      { label: 'Vegetable', value: 'Vegetable' },
    ],
  },
  {
    dataIndex: 'value',
    title: 'Price',
    render: (val: unknown) => `$${Number(val).toFixed(2)}`,
  },
];

describe('DataTable', () => {
  it('renders headers and data rows correctly', () => {
    render(<DataTable columns={columns} data={mockData} />);

    // Verify Headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();

    // Verify Row Data
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Carrot')).toBeInTheDocument();
    expect(screen.getByText('$1.20')).toBeInTheDocument();
    expect(screen.getByText('$0.80')).toBeInTheDocument();
    expect(screen.getByText('$1.50')).toBeInTheDocument();
  });

  it('handles custom column rendering', () => {
    const customColumns: ITableColumn<ITestRow>[] = [
      ...columns,
      {
        dataIndex: 'id',
        title: 'Actions',
        render: (_: unknown, row: ITestRow) => (
          <button data-testid={`btn-action-${row.id}`}>Edit {row.name}</button>
        ),
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    expect(screen.getByTestId('btn-action-1')).toBeInTheDocument();
    expect(screen.getByTestId('btn-action-2')).toBeInTheDocument();
    expect(screen.getByTestId('btn-action-3')).toBeInTheDocument();
  });

  it('preserves custom header priority and a null cell renderer result', () => {
    const headerRender = vi.fn(() => null);
    const renderHeader = vi.fn(() => 'Legacy header');

    const customColumns: ITableColumn<ITestRow>[] = [
      {
        dataIndex: 'name',
        title: 'Name fallback',
        headerRender,
        renderHeader,
        render: () => null,
      },
    ];

    render(<DataTable columns={customColumns} data={[mockData[0]]} />);

    expect(headerRender).toHaveBeenCalledWith(customColumns[0]);
    expect(renderHeader).not.toHaveBeenCalled();
    expect(screen.queryByText('Name fallback')).not.toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.getByRole('cell')).toBeEmptyDOMElement();
  });

  it('renders a nullish cell as empty when no custom renderer exists', () => {
    interface INullishRow {
      id: string;
      value: string | null;
    }

    const nullishColumns: ITableColumn<INullishRow>[] = [
      { dataIndex: 'value', title: 'Value' },
    ];

    render(
      <DataTable
        columns={nullishColumns}
        data={[{ id: 'row-1', value: null }]}
      />
    );

    expect(screen.getByRole('cell')).toBeEmptyDOMElement();
  });

  it('handles internal sorting toggles correctly via controlled wrapper', async () => {
    const user = userEvent.setup();
    render(<ControlledDataTableWrapper columns={columns} data={mockData} />);

    const nameHeader = screen.getByText('Name');

    // Default order (Apple, Banana, Carrot)
    let rows = screen.getAllByRole('row').slice(1); // skip header row
    expect(rows[0]).toHaveTextContent('Apple');
    expect(rows[1]).toHaveTextContent('Banana');
    expect(rows[2]).toHaveTextContent('Carrot');

    // 1st click: Ascending (A-Z) -> same order
    await user.click(nameHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Apple');
    expect(rows[1]).toHaveTextContent('Banana');
    expect(rows[2]).toHaveTextContent('Carrot');

    // 2nd click: Descending (Z-A)
    await user.click(nameHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Carrot');
    expect(rows[1]).toHaveTextContent('Banana');
    expect(rows[2]).toHaveTextContent('Apple');
  });

  it('calls external onSortChange when provided', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={mockData}
        onSortChange={onSortChange}
      />
    );

    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('handles row selection correctly', async () => {
    const user = userEvent.setup();
    const onRowSelectionChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={mockData}
        selectable={true}
        onRowSelectionChange={onRowSelectionChange}
      />
    );

    // Click select checkbox of first row
    const rowCheckboxes = screen.getAllByLabelText(/select row/i);
    await user.click(rowCheckboxes[0]);

    expect(onRowSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('respects controlled selectedRowIds prop and does not maintain internal selection state', async () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={mockData}
        selectable={true}
        selectedRowIds={[1]}
      />
    );

    expect(screen.getByLabelText('Deselect row 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Select row 2')).toBeInTheDocument();

    // Rerender with different selectedRowIds
    rerender(
      <DataTable
        columns={columns}
        data={mockData}
        selectable={true}
        selectedRowIds={[2]}
      />
    );

    expect(screen.queryByLabelText('Deselect row 1')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Select row 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Deselect row 2')).toBeInTheDocument();
  });

  it('respects controlled filters prop and does not maintain internal filtering state', async () => {
    const { rerender } = render(
      <ControlledDataTableWrapper
        columns={columns}
        data={mockData}
        filters={{ category: ['Fruit'] }}
      />
    );

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument();

    rerender(
      <ControlledDataTableWrapper
        columns={columns}
        data={mockData}
        filters={{ category: ['Vegetable'] }}
      />
    );

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.getByText('Carrot')).toBeInTheDocument();
  });

  it('respects controlled currentSortKey and currentSortDirection props', () => {
    const { rerender } = render(
      <ControlledDataTableWrapper
        columns={columns}
        data={mockData}
        currentSortKey="name"
        currentSortDirection="desc"
      />
    );

    let rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Carrot');
    expect(rows[1]).toHaveTextContent('Banana');
    expect(rows[2]).toHaveTextContent('Apple');

    rerender(
      <ControlledDataTableWrapper
        columns={columns}
        data={mockData}
        currentSortKey="name"
        currentSortDirection="asc"
      />
    );

    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Apple');
    expect(rows[1]).toHaveTextContent('Banana');
    expect(rows[2]).toHaveTextContent('Carrot');
  });

  it('renders empty state correctly when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('renders loading skeletons correctly when loading is true', () => {
    render(<DataTable columns={columns} data={[]} loading={true} />);

    // Should render skeletons instead of the empty state
    expect(screen.queryByText('No records found')).not.toBeInTheDocument();
  });

  it('renders active filter chips and handles individual removal or clear all', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    const { rerender } = render(
      <DataTable
        columns={columns}
        data={mockData}
        filters={{ category: ['Fruit'] }}
        onFilterChange={onFilterChange}
      />
    );

    // Verify filter chip is rendered
    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getAllByText('Fruit').length).toBeGreaterThan(0);

    // Click remove button of the chip
    const removeBtn = screen.getByLabelText(/remove filter category is fruit/i);
    await user.click(removeBtn);

    expect(onFilterChange).toHaveBeenCalledWith({});

    // Test with multiple filters to verify Clear All button
    rerender(
      <DataTable
        columns={columns}
        data={mockData}
        filters={{ category: ['Fruit', 'Vegetable'] }}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getAllByText('Fruit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vegetable').length).toBeGreaterThan(0);

    const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllBtn);

    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });
});
