import { CategorySectionError } from '@/account/pages/categories/parts/section-error';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Categories/Error',
  component: CategorySectionError,
  tags: ['autodocs'],
  args: { title: 'Category overview', onRetry: () => {} },
} satisfies Meta<typeof CategorySectionError>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
