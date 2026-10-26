import {
  AccountHeader,
  AccountHeaderSkeleton,
} from '@/account/pages/account-details/parts/account-header';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/AccountHeader',
  component: AccountHeader,
  tags: ['autodocs'],
  args: { account: { name: 'Main business account', status: 'active' } },
} satisfies Meta<typeof AccountHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Archived: Story = {
  args: { account: { name: 'Main business account', status: 'archived' } },
};
export const Draft: Story = {
  args: { account: { name: 'Main business account', status: 'draft' } },
};
export const NarrowWithLongName: Story = {
  args: {
    account: {
      name: 'International operations and regional supplier payments account',
      status: 'active',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
};
export const Skeleton: Story = { render: () => <AccountHeaderSkeleton /> };
