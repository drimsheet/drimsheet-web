import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTableSkeleton } from '..';

const meta = {
  title: 'Shared/Data-Table/Skeleton',
  component: DataTableSkeleton,
  args: { columnsCount: 3 },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
