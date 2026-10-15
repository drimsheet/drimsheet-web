import { AccountTreeNode } from '@/account/pages/category-creation/parts/account-tree-node';
import type { TCategoryAccount } from '@/account/pages/category-creation/types';
import { RadioGroup } from '@/shared/components/radio-group';
import type { Meta, StoryObj } from '@storybook/react-vite';

const accounts: TCategoryAccount[] = [
  {
    id: 'expenses' as TCategoryAccount['id'],
    name: 'Operating expenses',
    code: '5100',
    type: 'expense',
    behavior: 'rent_and_utilities',
    isControlAccount: true,
    status: 'active',
    children: [
      {
        id: 'utilities' as TCategoryAccount['id'],
        name: 'Utilities',
        code: '5101',
        type: 'expense',
        behavior: 'rent_and_utilities',
        isControlAccount: false,
        status: 'active',
        children: [],
      },
    ],
  },
];

const meta = {
  title: 'Ledger Accounts/Category Creation/Account Tree Node',
  component: AccountTreeNode,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <RadioGroup aria-label="Chart of accounts">
        <ul>
          <Story />
        </ul>
      </RadioGroup>
    ),
  ],
  args: { account: accounts[0] },
} satisfies Meta<typeof AccountTreeNode>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Nested: Story = {};
export const Archived: Story = {
  args: { account: { ...accounts[0].children[0], status: 'archived' } },
};
export const LongName: Story = {
  args: {
    account: {
      ...accounts[0],
      name: 'Office operations, facilities maintenance, and recurring utilities',
    },
  },
};
