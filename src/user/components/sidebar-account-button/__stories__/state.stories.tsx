import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarAccountButtonSkeleton } from '..';

const meta = {
  title: 'User/Sidebar-Account-Button/Skeleton',
  component: SidebarAccountButtonSkeleton,
  args: {},
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarAccountButtonSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
