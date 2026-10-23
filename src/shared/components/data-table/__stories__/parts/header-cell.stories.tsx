import { DataTableHeaderCell } from '@/shared/components/data-table/parts/header-cell';
import { Table, TableHeader, TableRow } from '@/shared/components/table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/DataTable/HeaderCell',
  component: DataTableHeaderCell<{ id: string; account: string }>,
  tags: ['autodocs'],
  args: {
    column: {
      dataIndex: 'account',
      title: 'Account',
      sortable: true,
      filterable: true,
      filterOptions: [{ label: 'Savings', value: 'savings' }],
    },
    direction: 'asc',
    filterValues: ['savings'],
    onSort: () => {},
    onFilter: () => {},
  },
  decorators: [
    (Story) => (
      <Table>
        <TableHeader>
          <TableRow>
            <Story />
          </TableRow>
        </TableHeader>
      </Table>
    ),
  ],
} satisfies Meta<typeof DataTableHeaderCell<{ id: string; account: string }>>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
