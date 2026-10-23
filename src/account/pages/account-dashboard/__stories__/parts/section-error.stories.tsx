import { DashboardError } from '@/account/pages/account-dashboard/parts/section-error';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/DashboardError',
  component: DashboardError,
  tags: ['autodocs'],
  args: { title: 'Couldn’t load your accounts', onRetry: () => {} },
} satisfies Meta<typeof DashboardError>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Retrying: Story = { args: { pending: true } };
