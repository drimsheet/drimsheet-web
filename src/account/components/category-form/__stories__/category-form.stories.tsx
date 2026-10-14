import { CategoryForm } from '@/account/components/category-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/CategoryForm',
  component: CategoryForm,
  tags: ['autodocs'],
  args: {
    initialValues: { name: '', type: 'revenue', behavior: 'services' },
    editing: false,
    pending: false,
    error: false,
    onSubmit: async () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof CategoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Editing: Story = {
  args: {
    editing: true,
    initialValues: {
      name: 'Consulting services',
      type: 'revenue',
      behavior: 'services',
    },
  },
};
export const Saving: Story = { args: { pending: true } };
export const Failure: Story = { args: { error: true } };
