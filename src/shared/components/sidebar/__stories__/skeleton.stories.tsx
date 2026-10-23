import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarMenuButtonSkeleton } from '..';

const meta = {
  title: 'Shared/Sidebar/Skeleton',
  component: SidebarMenuButtonSkeleton,
  args: { showIcon: true },
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarMenuButtonSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
