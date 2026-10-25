import { EmptyAccountDashboard } from '@/account/pages/account-dashboard/parts/empty-account-dashboard';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/EmptyAccountDashboard',
  component: EmptyAccountDashboard,
  tags: ['autodocs'],
  args: { onAdd: () => {} },
} satisfies Meta<typeof EmptyAccountDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
