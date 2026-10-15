import { CategoryParentPicker } from '@/account/pages/category-creation/parts/parent-picker';
import type { TCategoryAccount } from '@/account/pages/category-creation/types';
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
  title: 'Ledger Accounts/Category Creation/Parent Picker',
  component: CategoryParentPicker,
  tags: ['autodocs'],
  args: {
    type: 'expense',
    accounts,
    parent: null,
    loading: false,
    error: false,
    disabled: false,
    onSelect: () => {},
    onOpenChange: () => {},
    onRetry: () => {},
  },
} satisfies Meta<typeof CategoryParentPicker>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selected: Story = {
  args: {
    parent: {
      account: accounts[0].children[0],
      path: ['Operating expenses', 'Utilities'],
    },
  },
};
export const Loading: Story = { args: { loading: true } };
export const Failure: Story = { args: { error: true } };
export const Empty: Story = { args: { accounts: [] } };
export const ChooseTypeFirst: Story = { args: { type: '' } };
