import { CategoryTransactionCount } from '@/account/pages/category-details/parts/category-transaction-count';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/CategoryDetails/TransactionCount',
  component: CategoryTransactionCount,
  args: { transactionCount: 42 },
  decorators: [
    (Story) => (
      <dl>
        <Story />
      </dl>
    ),
  ],
} satisfies Meta<typeof CategoryTransactionCount>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { transactionCount: undefined } };
export const Unavailable: Story = { args: { transactionCount: null } };
