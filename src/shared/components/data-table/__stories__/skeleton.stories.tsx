import { DataTableSkeleton } from '@/shared/components/data-table';
import { Table, TableBody } from '@/shared/components/table';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/DataTable/Skeleton',
  component: DataTableSkeleton,
  tags: ['autodocs'],
  args: { columnsCount: 3 },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
} satisfies Meta<typeof DataTableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
