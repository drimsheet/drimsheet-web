import type { Meta, StoryObj } from '@storybook/react-vite';
import { LedgerAccountsOverviewSkeleton } from '..';

const meta = {
  title: 'Ledger Accounts/LedgerAccountsOverview/Skeleton',
  component: LedgerAccountsOverviewSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof LedgerAccountsOverviewSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
