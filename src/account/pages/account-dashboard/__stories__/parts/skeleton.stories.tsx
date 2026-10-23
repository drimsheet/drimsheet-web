import { DashboardSkeleton } from '@/account/pages/account-dashboard/parts/skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/DashboardSkeleton',
  component: DashboardSkeleton,
  tags: ['autodocs'],
  args: { section: 'summary' },
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const History: Story = { args: { section: 'history' } };
export const Breakdown: Story = { args: { section: 'breakdown' } };
