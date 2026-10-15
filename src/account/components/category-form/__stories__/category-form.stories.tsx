import { CategoryForm } from '@/account/components/category-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/CategoryForm',
  component: CategoryForm,
  tags: ['autodocs'],
  args: {
    initialValues: { name: 'Consulting services' },
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
    initialValues: {
      name: 'Consulting services',
    },
  },
};
export const Saving: Story = { args: { pending: true } };
export const Failure: Story = { args: { error: true } };
