import {
  DataTableRow,
  DataTableRowSkeleton,
} from '@/shared/components/data-table/parts/data-row';
import { Table, TableBody } from '@/shared/components/table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/DataTable/DataRow',
  component: DataTableRow<{ id: number; name: string }>,
  tags: ['autodocs'],
  args: {
    row: { id: 1, name: 'Acme Studio' },
    columns: [{ dataIndex: 'name', title: 'Summary' }],
    selected: true,
    selectable: true,
    onSelect: () => {},
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
} satisfies Meta<typeof DataTableRow<{ id: number; name: string }>>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Selected: Story = {};

export const Loading: Story = {
  render: () => <DataTableRowSkeleton columnsCount={1} showSelection />,
};
